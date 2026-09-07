import { MessageMedia } from "whatsapp-web.js";
import SendMessageRequest from "../../models/SendMessageRequest";
import { getWbot, applyPatchesToWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";

interface QueuedMessage {
  fromNumber: string;
  toNumber: string;
  message: string;
  sendMessageRequest: SendMessageRequest;
  mediaUrl?: string | null;
  selectionMode: "round-robin";
  channel?: string | null;
  localId?: number | null;
  recipientName?: string | null;
  notificationType?: string | null;
  surveyName?: string | null;
  classification?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
}

interface QueueConfig {
  delayBetweenMessages: number;
}

// Estado global de la cola
const queueState = {
  queue: [] as QueuedMessage[],
  processing: false,
  lastSentTimestamp: 0,
  config: {
    delayBetweenMessages: 45000 // 45 segundos entre cada mensaje
  } as QueueConfig
};

const ELIGIBLE_CONNECTION_STATES = ["CONNECTED", "PAIRING"];

// Estado de alternancia global
const alternationState = {
  currentIndex: 0
};

const normalizePhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, "").trim();
};

const getInitializedConnectionByNumber = async (
  fromNumber: string
): Promise<Whatsapp | null> => {
  const normalizedFromNumber = normalizePhoneNumber(fromNumber);

  const connection = await Whatsapp.findOne({
    where: {
      number: normalizedFromNumber,
      status: ELIGIBLE_CONNECTION_STATES
    },
    order: [["id", "DESC"]]
  });

  if (!connection) {
    console.log(
      `[wbot-queue] ⚠️ Conexión ${normalizedFromNumber} descartada: no está en ${ELIGIBLE_CONNECTION_STATES.join(", ")}`
    );
    return null;
  }

  const wbot = getWbot(connection.id);
  if (!(wbot as any)?.info) {
    console.log(
      `[wbot-queue] ⚠️ Conexión ${normalizedFromNumber} descartada: sesión no inicializada`
    );
    return null;
  }

  return connection;
};

const getEligibleConnections = async (): Promise<Whatsapp[]> => {
  const activeConnections = await Whatsapp.findAll({
    where: {
      status: ELIGIBLE_CONNECTION_STATES
    },
    order: [["id", "ASC"]]
  });

  const eligibleConnections: Whatsapp[] = [];

  for (const connection of activeConnections) {
    const validatedConnection = await getInitializedConnectionByNumber(
      connection.number
    );

    if (validatedConnection) {
      eligibleConnections.push(validatedConnection);
    }
  }

  return eligibleConnections;
};

const getNextConnection = (connections: Whatsapp[]): Whatsapp => {
  const nextIndex = alternationState.currentIndex % connections.length;
  const selectedConnection = connections[nextIndex];

  alternationState.currentIndex = (nextIndex + 1) % connections.length;

  return selectedConnection;
};

const getFallbackConnection = async (
  excludedFromNumber?: string
): Promise<Whatsapp | null> => {
  const eligibleConnections = await getEligibleConnections();

  const fallbackConnection = eligibleConnections.find(connection => {
    if (!excludedFromNumber) {
      return true;
    }

    return normalizePhoneNumber(connection.number) !== excludedFromNumber;
  });

  return fallbackConnection || null;
};

const resolveOutgoingConnection = async ({
  fromNumber
}: {
  fromNumber?: string;
}): Promise<{
  selectedFromNumber: string | null;
  selectionMode: "round-robin";
}> => {
  if (fromNumber) {
    console.log(
      `[wbot-queue] ℹ️ fromNumber ${normalizePhoneNumber(fromNumber)} recibido, pero este flujo usa alternancia automática.`
    );
  }

  const eligibleConnections = await getEligibleConnections();
  if (!eligibleConnections.length) {
    console.log("[wbot-queue] ❌ No hay conexiones elegibles para alternancia");
    return {
      selectedFromNumber: null,
      selectionMode: "round-robin"
    };
  }

  const selectedConnection = getNextConnection(eligibleConnections);
  const normalizedFromNumber = normalizePhoneNumber(selectedConnection.number);

  console.log(
    `[wbot-queue] 🔄 Conexión seleccionada por alternancia: ${normalizedFromNumber} (siguiente índice: ${alternationState.currentIndex})`
  );

  return {
    selectedFromNumber: normalizedFromNumber,
    selectionMode: "round-robin"
  };
};

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const processQueue = async () => {
  if (queueState.processing) return;
  queueState.processing = true;

  while (queueState.queue.length > 0) {
    const now = Date.now();
    const timeSinceLastSent = now - queueState.lastSentTimestamp;
    const requiredDelay = queueState.config.delayBetweenMessages;

    // Respetar delay entre mensajes
    if (queueState.lastSentTimestamp > 0 && timeSinceLastSent < requiredDelay) {
      await delay(requiredDelay - timeSinceLastSent);
    }

    const message = queueState.queue.shift();
    if (!message) continue;

    try {
      console.log(
        `[wbot-queue] 🔍 Validando conexión ${message.fromNumber} para ${message.toNumber} (${message.selectionMode})`
      );

      const fromWpp = await getInitializedConnectionByNumber(message.fromNumber);

      if (!fromWpp) {
        const fallbackConnection = await getFallbackConnection(message.fromNumber);

        if (fallbackConnection) {
          const fallbackFromNumber = normalizePhoneNumber(fallbackConnection.number);

          console.warn(
            `[wbot-queue] 🔁 La conexión ${message.fromNumber} no está disponible para ${message.toNumber}. Se usará fallback ${fallbackFromNumber}.`
          );

          message.fromNumber = fallbackFromNumber;

          queueState.queue.unshift(message);
          continue;
        }

        console.error(
          `[wbot-queue] ❌ La conexión ${message.fromNumber} ya no está disponible para ${message.toNumber} y no hay fallback elegible.`
        );

        const allConnections = await Whatsapp.findAll({
          attributes: ["id", "name", "number", "status"]
        });
        console.error(
          "[wbot-queue] 📋 Conexiones disponibles en DB:",
          JSON.stringify(allConnections, null, 2)
        );

        message.sendMessageRequest.status = "failed";
        await message.sendMessageRequest.save();
        continue;
      }

      const wbot = getWbot(fromWpp.id);

      // Verificar que la sesión esté completamente inicializada
      if (!(wbot as any)?.info) {
        console.error(`[wbot-queue] ❌ Sesión de WhatsApp ID ${fromWpp.id} no está completamente inicializada (falta info)`);
        message.sendMessageRequest.status = 'failed';
        await message.sendMessageRequest.save();
        continue;
      }

      // Verificar estado de conexión
      try {
        const wbotState = await wbot.getState();
        const validStates = ["CONNECTED", "PAIRING", "OPENING"];

        if (!validStates.includes(wbotState)) {
          console.error(`[wbot-queue] ❌ WhatsApp ${fromWpp.id} en estado inválido: ${wbotState}. Estados válidos: ${validStates.join(', ')}`);
          message.sendMessageRequest.status = 'failed';
          await message.sendMessageRequest.save();
          continue;
        }
        
        console.log(`[wbot-queue] ✓ Estado válido: ${wbotState}`);
      } catch (stateErr) {
        console.warn(`[wbot-queue] ⚠️ No se pudo verificar estado para WhatsApp ${fromWpp.id}:`, stateErr.message);
        // Continuar con precaución
      }

      // Validar que los parches estén aplicados (CRÍTICO para que funcione)
      if ((wbot as any)?.pupPage && !(wbot as any).pupPage.isClosed()) {
        try {
          const patchStatus = await (wbot as any).pupPage.evaluate(() => {
            return {
              applied: !!(window as any).__whaticket_patch_applied,
              wwebjsExists: typeof (window as any).WWebJS !== 'undefined',
              getChatExists: typeof (window as any).WWebJS?.getChat === 'function'
            };
          });
          
          if (!patchStatus.applied || !patchStatus.wwebjsExists || !patchStatus.getChatExists) {
            console.error(`[wbot-queue] ❌ Patches no aplicados correctamente para WhatsApp ${fromWpp.id}`, patchStatus);
            console.error(`[wbot-queue] ❌ Esto causará que los mensajes no se envíen. Reconectar WhatsApp.`);
            message.sendMessageRequest.status = 'failed';
            await message.sendMessageRequest.save();
            continue;
          }
          
          console.log('[wbot-queue] ✓ Patches validados correctamente');
        } catch (validationErr) {
          console.error(`[wbot-queue] ❌ No se pudo validar patches:`, validationErr.message);
          message.sendMessageRequest.status = 'failed';
          await message.sendMessageRequest.save();
          continue;
        }
      } else {
        console.error(`[wbot-queue] ❌ pupPage no disponible para WhatsApp ${fromWpp.id}`);
        message.sendMessageRequest.status = 'failed';
        await message.sendMessageRequest.save();
        continue;
      }

      // Obtener el ID correcto del destinatario (soporta @c.us antiguo y @lid nuevo)
      console.log(`[wbot-queue] 🔍 Obteniendo ID correcto para: ${message.toNumber}`);
      
      let destinationId: string;
      try {
        const numberId = await wbot.getNumberId(`${message.toNumber}@c.us`);
        
        if (!numberId) {
          // Si getNumberId retorna null, el número NO está registrado en WhatsApp
          console.error(`[wbot-queue] ❌ Número ${message.toNumber} no encontrado en WhatsApp (getNumberId retornó null)`);
          throw new Error(`Número ${message.toNumber} no está registrado en WhatsApp`);
        }
        
        // Usar el ID obtenido (puede ser @c.us o @lid)
        destinationId = numberId._serialized;
        console.log(`[wbot-queue] ✅ ID obtenido y validado: ${destinationId} (número registrado en WhatsApp)`);
      } catch (error: any) {
        // Si getNumberId falla, lanzar error en lugar de usar fallback
        console.error(`[wbot-queue] ❌ Error obteniendo ID para ${message.toNumber}:`, error?.message || error);
        throw new Error(`No se pudo obtener ID de WhatsApp para ${message.toNumber}: ${error?.message || 'Error desconocido'}`);
      }

      // Enviar mensaje usando el ID correcto
      console.log(`[wbot-queue] 📤 Enviando mensaje a ${destinationId}...`);
      let sentMessage;
      
      if (message.mediaUrl) {
        const media = await MessageMedia.fromUrl(message.mediaUrl);
        sentMessage = await wbot.sendMessage(destinationId, media, {
          caption: message.message,
          linkPreview: false
        });
      } else {
        sentMessage = await wbot.sendMessage(destinationId, message.message, {
          linkPreview: false
        });
      }

      // Esperar 3 segundos para que WhatsApp Web procese y envíe el mensaje
      console.log(`[wbot-queue] ⏳ Esperando 3s para que WhatsApp procese el mensaje...`);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Intentar obtener el mensaje actualizado para verificar el ACK
      try {
        const updatedMessage = await wbot.getMessageById(sentMessage.id._serialized);
        if (updatedMessage) {
          sentMessage = updatedMessage;
          console.log(`[wbot-queue] 🔄 Mensaje actualizado después de 3s - ACK: ${updatedMessage.ack}`);
        }
      } catch (refreshError) {
        console.warn(`[wbot-queue] ⚠️ No se pudo refrescar el mensaje:`, refreshError.message);
      }

      // Validar que el mensaje fue enviado correctamente
      if (!sentMessage || !sentMessage.id) {
        console.error(`[wbot-queue] ❌ El mensaje no fue enviado correctamente (sin ID de mensaje)`);
        throw new Error('El mensaje no fue enviado correctamente por WhatsApp');
      }

      // Logging detallado del mensaje enviado
      console.log(`[wbot-queue] ✅ Mensaje enviado a WhatsApp:`, {
        messageId: sentMessage.id.id,
        to: sentMessage.to,
        from: sentMessage.from,
        timestamp: sentMessage.timestamp,
        ack: sentMessage.ack,
        hasMedia: !!message.mediaUrl,
        body: sentMessage.body?.substring(0, 50) || '(media)'
      });

      // Verificar el ACK (acknowledgment) del mensaje
      // ack: -1 = error, 0 = pendiente (inicial), 1 = enviado al servidor, 2 = entregado, 3 = leído
      // NOTA: ACK 0 es NORMAL inicialmente. El ACK se actualiza después de forma asíncrona
      // vía el evento 'message_ack' en wbotMessageListener.ts
      if (sentMessage.ack === -1) {
        console.error(`[wbot-queue] ❌ Mensaje con ACK de error (-1)`);
        throw new Error('WhatsApp rechazó el mensaje (ACK -1)');
      }

      // Log informativo del ACK inicial (no es un error si es 0)
      console.log(`[wbot-queue] 📊 ACK inicial: ${sentMessage.ack} (${
        sentMessage.ack === 0 ? 'Pendiente - se actualizará vía evento message_ack' : 
        sentMessage.ack === 1 ? 'Enviado al servidor' : 
        sentMessage.ack === 2 ? 'Entregado' : 
        sentMessage.ack === 3 ? 'Leído' : 'Desconocido'
      })`);

      message.sendMessageRequest.status = 'sent';
      queueState.lastSentTimestamp = Date.now();

    } catch (error: any) {
      console.error('[wbot-queue] ❌ Error enviando mensaje:', {
        error: error?.message || error,
        fromNumber: message.fromNumber,
        toNumber: message.toNumber,
        stack: error?.stack
      });
      message.sendMessageRequest.status = 'failed';
    }

    await message.sendMessageRequest.save();
  }

  queueState.processing = false;
};

export const addMessageToQueue = async ({
  fromNumber,
  toNumber,
  message,
  mediaUrl = null,
  channel = null,
  localId = null,
  recipientName = null,
  notificationType = null,
  surveyName = null,
  classification = null,
  clientName = null,
  clientPhone = null
}: {
  fromNumber?: string;
  toNumber: string;
  message: string;
  mediaUrl?: string | null;
  channel?: string | null;
  localId?: number | null;
  recipientName?: string | null;
  notificationType?: string | null;
  surveyName?: string | null;
  classification?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
}) => {
  const mensajes: string[] = [];
  let data = null;

  // Validaciones
  if (!toNumber || !message) {
    mensajes.push('Faltan datos necesarios para enviar el mensaje (toNumber y message son requeridos)');
    return { mensajes, data };
  }

  // Validar que toNumber sea string antes de usar replace
  if (typeof toNumber !== 'string') {
    mensajes.push('El número de destino debe ser un string válido');
    return { mensajes, data };
  }

  // Normalizar fromNumber: tratar string vacío como undefined
  if (fromNumber === '') {
    fromNumber = undefined;
  }

  // Validar formato de números
  if (isNaN(Number(toNumber.replace(/\D/g, '')))) {
    mensajes.push('Número de teléfono de destino inválido');
    return { mensajes, data };
  }

  if (fromNumber && typeof fromNumber !== 'string') {
    console.warn('[wbot-queue] ⚠️ fromNumber recibido con tipo inválido; será ignorado por alternancia automática.');
    fromNumber = undefined;
  } else if (fromNumber && isNaN(Number(fromNumber.replace(/\D/g, '')))) {
    console.warn('[wbot-queue] ⚠️ fromNumber recibido con formato inválido; será ignorado por alternancia automática.');
    fromNumber = undefined;
  }

  if (!mensajes.length) {
    // Limpiar números
    toNumber = normalizePhoneNumber(toNumber);
    fromNumber = fromNumber ? normalizePhoneNumber(fromNumber) : undefined;

    const resolvedConnection = await resolveOutgoingConnection({
      fromNumber
    });

    if (!resolvedConnection.selectedFromNumber) {
      // Se registra el intento aunque no haya conexion para enviarlo: el historial de
      // notificaciones se alimenta de esta tabla, y sin esta fila un envio que nunca sale
      // resulta invisible para quien lo configuro.
      await SendMessageRequest.create({
        fromNumber: fromNumber || '',
        toNumber,
        message,
        status: 'failed',
        channel,
        localId,
        recipientName,
        notificationType,
        surveyName,
        classification,
        clientName,
        clientPhone
      });

      mensajes.push('No hay conexiones elegibles disponibles para este envío');
      return { mensajes, data };
    }

    fromNumber = resolvedConnection.selectedFromNumber;

    const sendMessageRequest = await SendMessageRequest.create({
      fromNumber,
      toNumber,
      message,
      channel,
      localId,
      recipientName,
      notificationType,
      surveyName,
      classification,
      clientName,
      clientPhone
    });

    queueState.queue.push({
      fromNumber,
      toNumber,
      message,
      mediaUrl,
      sendMessageRequest,
      selectionMode: resolvedConnection.selectionMode,
      channel,
      localId,
      recipientName,
      notificationType,
      surveyName,
      classification,
      clientName,
      clientPhone
    });
    console.log(`[wbot-queue] 📨 Mensaje agregado a la cola. Total en cola: ${queueState.queue.length}`);

    if (!queueState.processing) {
      processQueue();
    }

    data = { sendMessageRequest };
  }

  return { mensajes, data };
};
