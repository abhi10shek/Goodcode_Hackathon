'use strict';
const objecthash = require('object-hash')
const deepdiff = require('deep-diff').diff

class Operation {
  constructor(key, application, operation, modifiedBy, modifiedFields, hash) {

      this.key = key;
      this.application = application;
      this.operation = createOperationobj(operation, modifiedBy, modifiedFields, hash)
      
      if (this.__isContract) {
        delete this.__isContract;
      }
      if (this.name) {
        delete this.name;
      }
      return this;
  }

}

function createHash(hash){
  return objecthash(hash)
}

function findmodifiedFields(oldobj, newobj){
  return deepdiff(oldobj, newobj)
}

function createOperationobj(operation, modifiedBy, modifiedFields, data){
    return {
      name : operation,
      modifiedBy : modifiedBy,
      modifiedFields : modifiedFields,
      data : data,
      hash : createHash(data)
    }
}
module.exports.Operation = Operation
module.exports.createOperationobj = createOperationobj
module.exports.createHash = createHash
module.exports.findmodifiedFields = findmodifiedFields