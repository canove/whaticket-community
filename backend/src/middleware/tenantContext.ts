import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import authConfig from "../config/auth";
import Tenant from "../models/Tenant";
import AppError from "../errors/AppError";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  tenantId: number;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      tenantId?: number;
      tenant?: Tenant;
    }
  }
}

const tenantContext = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let tenantId: number | null = null;

  try {
    // 1. Primeiro, tenta obter tenant do token JWT (para usuários autenticados)
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const [, token] = authHeader.split(" ");
      if (token) {
        try {
          const decoded = verify(token, authConfig.secret) as TokenPayload;
          tenantId = decoded.tenantId;
        } catch (err) {
          // Token inválido, continua tentando outras formas
        }
      }
    }

    // 2. Se não conseguiu pelo token, tenta pelo header X-Tenant-ID
    if (!tenantId) {
      const tenantHeader = req.headers["x-tenant-id"];
      if (tenantHeader) {
        tenantId = parseInt(tenantHeader as string, 10);
      }
    }

    // 3. Se não conseguiu pelo header, tenta pelo subdomínio
    if (!tenantId) {
      const host = req.headers.host || "";
      const subdomain = host.split(".")[0];
      
      if (subdomain && subdomain !== "www" && subdomain !== "api") {
        const tenant = await Tenant.findOne({
          where: { domain: subdomain }
        });
        if (tenant) {
          tenantId = tenant.id;
        }
      }
    }

    // 4. Se ainda não conseguiu, usa o tenant padrão (ID 1)
    if (!tenantId) {
      tenantId = 1; // Tenant padrão
    }

    // Busca o tenant completo
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      throw new AppError("Tenant não encontrado", 404);
    }

    if (tenant.status !== "active") {
      throw new AppError("Tenant inativo", 403);
    }

    // Adiciona o contexto do tenant na requisição
    req.tenantId = tenantId;
    req.tenant = tenant;

    return next();
  } catch (error) {
    throw new AppError("Erro ao determinar contexto do tenant", 500);
  }
};

export default tenantContext;