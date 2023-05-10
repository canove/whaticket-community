import { Op } from "sequelize";
import ExposedImport from "../../database/models/ExposedImport";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";
import ConnectionFiles from "../../database/models/ConnectionFile";

interface Request {
  exposedImportId: string;
  companyId: number;
  payload: any;
}

const objToString = (obj: any) => {
  try {
    const string = JSON.stringify(obj);
    return string;
  } catch {
    return "";
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

  return (value && typeof value === "string") ? value : objToString(value);
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

interface Response {
  requiredItems: string[];
  registersWithError: string[];
  newPayload: string[];
  registersWithNonExistentCategory: string[];
}

const TestRequiredExposedImportService = async ({
  exposedImportId,
  companyId,
  payload
}: Request): Promise<Response | null> => {
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

  const requiredItems = JSON.parse(exposedImport.requiredItems);

  if (requiredItems) {
    const mapping = JSON.parse(exposedImport.mapping);

    if (Array.isArray(payload)) {
      let newPayload = [];
      let registersWithError = [];
      let registersWithNonExistentCategory = [];
      let newRequiredItems = [];

      let categoryDictionary = {};

      for (const obj of payload) {
        try {
          const name = getRelationValue(mapping.name, obj);
          const phoneNumber = getRelationValue(mapping.phoneNumber, obj);
          const documentNumber = getRelationValue(mapping.documentNumber, obj);
          const template = getRelationValue(mapping.template, obj);
          const templateParams = getRelationValue(mapping.templateParams, obj);
          const message = getRelationValue(mapping.message, obj);
          const var1 = getRelationValue(mapping.var1, obj);
          const var2 = getRelationValue(mapping.var2, obj);
          const var3 = getRelationValue(mapping.var3, obj);
          const var4 = getRelationValue(mapping.var4, obj);
          const var5 = getRelationValue(mapping.var5, obj);
          const phoneNumberFrom = getRelationValue(mapping.phoneNumberFrom, obj);
          const category = getRelationValue(mapping.category, obj);

          // let whatsappId = null;

          // if (phoneNumberFrom) {
          //   const whatsapp = await Whatsapp.findOne({
          //     where: { name: phoneNumberFrom, companyId, official: true, deleted: false }
          //   });

          //   whatsappId = whatsapp ? whatsapp.id : null;
          // }

          const register = {
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
            phoneNumberFrom,
            category,
            // whatsappId,
            // connectionFileId,
          };

          const requiredItem = requiredItems.find((item) => (!register[item] || register[item] === 'undefined' || register[item] === '""'));

          if (newRequiredItems.length === 0) {
            requiredItems.forEach(item => {
              if (mapping[item]) {
                newRequiredItems.push(mapping[item]);
              } else {
                newRequiredItems.push(item);
              }
            });
          }

          if (requiredItem) {
            registersWithError.push(obj);
            continue;
          }

          if (requiredItems.includes("category")) {
            if (!categoryDictionary[category]) {
              categoryDictionary[category] = await ConnectionFiles.findOne({
                where: { 
                  [Op.or]: [ { name: category }, { uniqueCode: category } ],
                  companyId 
                }
              });
            }
    
            if (!categoryDictionary[category]) {
              registersWithNonExistentCategory.push(obj);
              continue;
            }
          }

          newPayload.push(obj);
        } catch (err) {
          console.log(err);
        }
      }

      if (registersWithError.length > 0 || registersWithNonExistentCategory.length > 0) {
        return {
          requiredItems: newRequiredItems,
          registersWithError,
          newPayload,
          registersWithNonExistentCategory,
        };
      }

      return null;
    } else {
      const name = getRelationValue(mapping.name, payload);
      const phoneNumber = getRelationValue(mapping.phoneNumber, payload);
      const documentNumber = getRelationValue(mapping.documentNumber, payload);
      const template = getRelationValue(mapping.template, payload);
      const templateParams = getRelationValue(mapping.templateParams, payload);
      const message = getRelationValue(mapping.message, payload);
      const var1 = getRelationValue(mapping.var1, payload);
      const var2 = getRelationValue(mapping.var2, payload);
      const var3 = getRelationValue(mapping.var3, payload);
      const var4 = getRelationValue(mapping.var4, payload);
      const var5 = getRelationValue(mapping.var5, payload);
      const phoneNumberFrom = getRelationValue(mapping.phoneNumberFrom, payload);
      const category = getRelationValue(mapping.category, payload);

      // let whatsappId = null;

      // if (phoneNumberFrom) {
      //   const whatsapp = await Whatsapp.findOne({
      //     where: { name: phoneNumberFrom, companyId, official: true, deleted: false }
      //   });

      //   whatsappId = whatsapp ? whatsapp.id : null;
      // }

      const register = {
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
        phoneNumberFrom,
        category,
        // whatsappId,
        // connectionFileId,
      }

      let requiredItem = "";

      requiredItems.find((item) => {
        if (!register[item] || register[item] === 'undefined' || register[item] === '""') {
          requiredItem = mapping[item] ?? item;

          return true;
        }
      });

      if (requiredItem) throw new AppError(`${requiredItem} is required.`);

      if (requiredItems.includes("category")) {
        const categoryExists = await ConnectionFiles.findOne({
          where: { 
            [Op.or]: [ { name: category }, { uniqueCode: category } ],
            companyId 
          }
        });

        if (!categoryExists) throw new AppError(`category ${category} do not exists.`);
      }
    }
  }

  return null;
};

export default TestRequiredExposedImportService;
