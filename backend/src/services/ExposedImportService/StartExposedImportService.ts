/*eslint-disable*/

import { Op } from "sequelize";
import ExposedImport from "../../database/models/ExposedImport";
import FileRegister from "../../database/models/FileRegister";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";
import { preparePhoneNumber, preparePhoneNumber9Digit, removePhoneNumber9Digit } from "../../utils/common";

interface Request {
  exposedImportId: string;
  companyId: number;
  payload: any;
}

const jsonStringToObj = (jsonString: any) => {
  try {
    const responseObj = JSON.parse(jsonString);
    return responseObj;
  } catch {
    return false;
  }
};

const getDinamicValue = (path: any, payload: any) => {
  const keys = path.split(".");
  let value = payload;

  for (let i = 0; i < keys.length; i++) {
    if (value === undefined) {
      return "";
    }

    if (Array.isArray(value)) {
      const array = [];

      for (const item of value) {
        array.push(item[keys[i]]);
      }

      value = array;
    } else {
      value = value[keys[i]];
    }
  }



  return value || "";
};

const getRelationValue = (newValue: any, payload: any) => {
  if (!newValue) return "";

  let value = newValue;

  if(!value)
    return '';

  while (value.match(/\{{(.*?)\}}/)) {
    const param = value.match(/\{{(.*?)\}}/);

    const dinamicValue = getDinamicValue(param[1].trim(), payload);

    value = value.replace(param[0], dinamicValue);
  }

  return value;
};

let numberDispatcher = {};

const StartExposedImportService = async ({
  exposedImportId,
  companyId,
  payload
}: Request): Promise<ExposedImport> => {
  const exposedImport = await ExposedImport.findOne({
    where: {
      id: exposedImportId,
      companyId,
      deletedAt: { [Op.is]: null }
    }
  });

  if (!exposedImport) {
    throw new AppError("ERR_NO_IMPORT_FOUND", 404);
  }

  const mapping = JSON.parse(exposedImport.mapping);
  const phoneNumber = getRelationValue(mapping.phoneNumber, payload);

  if(numberDispatcher[phoneNumber]) {
    throw new AppError("DUPLICATED_NUMBER", 403);
  }

  numberDispatcher[phoneNumber] = [];

  let totalRegisters = exposedImport.qtdeRegister;
  var today = new Date();
  today.setHours(today.getHours() - 4);

  if (Array.isArray(payload)) {
    let registersToInsert = [];

    for (const obj of payload) {
      try {
        const name = getRelationValue(mapping.name, obj);

        const register = await FileRegister.findOne({
          where: {
            companyId: companyId,
            createdAt: {
              [Op.gte]: today
            },
            phoneNumber: {
              [Op.or] : [
                {[Op.like]: `%${phoneNumber}%` },
                {[Op.like]: `%${preparePhoneNumber(phoneNumber)}%` },
                {[Op.like]: `%${removePhoneNumber9Digit(phoneNumber)}%` },
                {[Op.like]: `%${preparePhoneNumber9Digit(phoneNumber)}%` }
              ]
            }
         }});

         
         if(register) {
          continue;
         }

        const documentNumber = getRelationValue(mapping.documentNumber, obj);
        const template = getRelationValue(mapping.template, obj);
        const templateParams = getRelationValue(mapping.templateParams, obj);
        const message = getRelationValue(mapping.message, obj);
        const var1 = getRelationValue(mapping.var1, obj);
        const var2 = getRelationValue(mapping.var2, obj);
        const var3 = getRelationValue(mapping.var3, obj);
        const var4 = getRelationValue(mapping.var4, obj);
        const var5 = getRelationValue(mapping.var5, obj);
        const whatsappName = getRelationValue(mapping.phoneNumberFrom, obj);
        let whatsappId = null;

        if (whatsappName) {
          const whatsapp = await Whatsapp.findOne({
            where: { name: whatsappName, companyId, official: true, deleted: false }
          });

          whatsappId = whatsapp ? whatsapp.id : null;
        }

        registersToInsert.push({
          name,
          phoneNumber,
          exposedImportId,
          documentNumber,
          template,
          templateParams,
          message,
          var1,
          var2,
          var3,
          var4,
          var5,
          companyId,
          whatsappId
        });

        if (registersToInsert.length >= 500) {
          await FileRegister.bulkCreate(registersToInsert);
          totalRegisters += registersToInsert.length;
          registersToInsert = [];
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (registersToInsert.length > 0) {
      totalRegisters += registersToInsert.length;
      await FileRegister.bulkCreate(registersToInsert);
    }
    console.log("update exposedImport exposedImportService 145");
    await exposedImport.update({ qtdeRegister: totalRegisters });
  } else {
    const name = getRelationValue(mapping.name, payload);
    const register = await FileRegister.findAll({
      where: {
        companyId: companyId,
        createdAt: {
          [Op.gte]: today
        },
        phoneNumber: {
          [Op.or] : [
            {[Op.like]: `%${phoneNumber}%` },
            {[Op.like]: `%${preparePhoneNumber(phoneNumber)}%` },
            {[Op.like]: `%${removePhoneNumber9Digit(phoneNumber)}%` },
            {[Op.like]: `%${preparePhoneNumber9Digit(phoneNumber)}%` }
          ]
        },
     },
     order: [["createdAt", "DESC"]] 
    });

     if(register.length > 0) {
      delete numberDispatcher[phoneNumber];
      throw new AppError("DUPLICATED_NUMBER", 403);
     }

    const documentNumber = getRelationValue(mapping.documentNumber, payload);
    const template = getRelationValue(mapping.template, payload);
    const templateParams = getRelationValue(mapping.templateParams, payload);
    const message = getRelationValue(mapping.message, payload);
    const var1 = getRelationValue(mapping.var1, payload);
    const var2 = getRelationValue(mapping.var2, payload);
    const var3 = getRelationValue(mapping.var3, payload);
    const var4 = getRelationValue(mapping.var4, payload);
    const var5 = getRelationValue(mapping.var5, payload);
    const whatsappName = getRelationValue(mapping.phoneNumberFrom, payload);
    let whatsappId = null;

    if (whatsappName) {
      const whatsapp = await Whatsapp.findOne({
        where: { name: whatsappName, companyId, official: true, deleted: false }
      });

      whatsappId = whatsapp ? whatsapp.id : null;
    }

    await FileRegister.create({
      name,
      phoneNumber,
      exposedImportId,
      documentNumber,
      template,
      templateParams,
      message,
      var1,
      var2,
      var3,
      var4,
      var5,
      companyId,
      whatsappId
    });
    console.log("update exposedImport exposedImportService 186");
    await exposedImport.update({ qtdeRegister: totalRegisters + 1 });
  }

  exposedImport.reload();

  delete numberDispatcher[phoneNumber];

  return exposedImport;
};

export default StartExposedImportService;
