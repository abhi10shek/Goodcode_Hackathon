'use strict';

//import Hyperledger Fabric 1.4 SDK
const { Contract } = require('fabric-contract-api');

let Operation = require('./Operation.js')

class MyAssetContract extends Contract {

  async init(ctx) {

    console.log('instantiate was called!');

    // let users = [];
    // let user1 = await new User('abhi10shek','234');

    // users.push(user1);

    // await ctx.stub.putState(user1.username, Buffer.from(JSON.stringify(user1)));
    
    // return users;

  }



  /**
   *
   * createVoter
   *
   * Creates a voter in the world state, based on the args given.
   *  
   * @param args.voterId - the Id the voter, used as the key to store the voter object
   * @param args.registrarId - the registrar the voter is registered for
   * @param args.firstName - first name of voter
   * @param args.lastName - last name of voter
   * @returns - nothing - but updates the world state with a voter
   */
  async createUser(ctx, args) {

    args = JSON.parse(args);

    let newUser = await new User(args.username, args.email);

    await ctx.stub.putState(newUser.username, Buffer.from(JSON.stringify(newUser)));

    let response = `user with username ${newUser.username} is updated in the world state`;
    return response;
  }

  async createOperation(ctx, args) {
    args = JSON.parse(args);
    // let OperationArray = []
    let userid = await this.getCurrentUser(ctx)
    let newOperation = await new Operation.Operation(args.appname+args.key,args.appname, args.operationname, userid,"",args.hash);// ,{"a":"b"});
    // OperationArray.push(newOperation)
    let response1 = await ctx.stub.putState(newOperation.key, Buffer.from(JSON.stringify(newOperation)));
    if (response1){
      // user.Operation = true;
      // let result = await ctx.stub.putState(user.username, Buffer.from(JSON.stringify(user)))
      // console.log(result)
      return newOperation
    }
    else{
      response1.error = 'err';
      return response1;
    }
  }

  /**
   *
   * deleteMyAsset
   *
   * Deletes a key-value pair from the world state, based on the key given.
   *  
   * @param myAssetId - the key of the asset to delete
   * @returns - nothing - but deletes the value in the world state
   */
  async deleteOperation(ctx, args) {
    args = JSON.parse(args);
    const exists = await this.myAssetExists(ctx, args.appname+args.key);
    if (!exists) {
      throw new Error(`The my asset ${Operationname} does not exist`);
    }
    // const username =  await this.
    // let userAsBytes = await ctx.stub.getState(Operationname.slice(0, -7));
    // let user = await JSON.parse(userAsBytes);

    // user.Operation = false
    // let result = await ctx.stub.putState(user.username, Buffer.from(JSON.stringify(user)))
    await ctx.stub.deleteState(args.appname+args.key);
    return args.name;

  }

  async updateOperation(ctx, args) {
    args = JSON.parse(args);
    let userid = await this.getCurrentUser(ctx)

    let OperationAsBytes = await ctx.stub.getState(args.appname+args.key);
    let Operation_current = await JSON.parse(OperationAsBytes);
    // {"name":"abhi10shek","user":"Coffee","a":"b","modifiedFields":[1,2,3,4,5]}
    if (!Operation_current) {
      let response = {};
      response.error = 'Doesn\'t exist!';
      return response;
    }
    // console.log(args)
    // let modifiedFields = args.modifiedFields
    let last_operation = Operation_current.operation 
    // return last_operation;
    let modifiedFields = Operation.findmodifiedFields(last_operation.data, args.hash)
    let newOperation = Operation.createOperationobj(args.operationname, userid, modifiedFields, args.hash);// ,{"a":"b"});
    Operation_current.operation = newOperation
    let response1 = await ctx.stub.putState(Operation_current.key, Buffer.from(JSON.stringify(Operation_current)));
    return response1;
  }

  

  /**
   *
   * readMyAsset
   *
   * Reads a key-value pair from the world state, based on the key given.
   *  
   * @param myAssetId - the key of the asset to read
   * @returns - nothing - but reads the value in the world state
   */
  async readMyAsset(ctx, myAssetId) {

    const exists = await this.myAssetExists(ctx, myAssetId);

    if (!exists) {
      // throw new Error(`The my asset ${myAssetId} does not exist`);
      let response = {};
      response.error = `The my asset ${myAssetId} does not exist`;
      return response;
    }

    const buffer = await ctx.stub.getState(myAssetId);
    const asset = JSON.parse(buffer.toString());
    return asset;
  }


 
  /**
   *
   * myAssetExists
   *
   * Checks to see if a key exists in the world state. 
   * @param myAssetId - the key of the asset to read
   * @returns boolean indicating if the asset exists or not. 
   */
  async myAssetExists(ctx, myAssetId) {

    const buffer = await ctx.stub.getState(myAssetId);
    return (!!buffer && buffer.length > 0);

  }

  

  /**
   * Query and return all key value pairs in the world state.
   *
   * @param {Context} ctx the transaction context
   * @returns - all key-value pairs in the world state
  */
  async queryAll(ctx) {

    let queryString = {
      selector: {}
    };

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
    return queryResults;

  }

  /**
     * Evaluate a queryString
     *
     * @param {Context} ctx the transaction context
     * @param {String} queryString the query string to be evaluated
    */
  async queryWithQueryString(ctx, queryString) {

    console.log('query String');
    console.log(JSON.stringify(queryString));

    let resultsIterator = await ctx.stub.getQueryResult(queryString);

    let allResults = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let res = await resultsIterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};

        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;

        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }

        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await resultsIterator.close();
        console.info(allResults);
        console.log(JSON.stringify(allResults));
        return JSON.stringify(allResults);
      }
    }
  }
// {"appname":"vidconf","key":"abhi","operationname":"create","name":"user1","hash":{"a":"b","b":"c"}}
  async getTransactionHistory(ctx, id) {
    // let id = await ctx.stub.getTxID()
    let iterator = await ctx.stub.getHistoryForKey(id);
    // ctx.stub.getBl
    // return iterator
    // {"buffer":{"type":"Buffer","data":[10,143,2,10,140,2,10,64,56,57,101,102,101,98,101,49,53,55,56,49,51,100,101,98,57,49,53,97,56,57,55,98,97,50,56,57,97,57,50,55,97,53,51,56,100,101,49,53,57,101,51,55,52,48,99,53,54,56,102,52,97,50,53,101,98,57,52,53,98,97,54,97,18,185,1,123,34,107,101,121,34,58,34,105,100,109,97,98,104,105,34,44,34,97,112,112,108,105,99,97,116,105,111,110,34,58,34,105,100,109,34,44,34,111,112,101,114,97,116,105,111,110,34,58,91,123,34,110,97,109,101,34,58,34,99,114,101,97,116,101,34,44,34,109,111,100,105,102,105,101,100,66,121,34,58,34,117,115,101,114,49,34,44,34,109,111,100,105,102,105,101,100,70,105,101,108,100,115,34,58,34,34,44,34,100,97,116,97,34,58,123,34,97,34,58,34,98,34,44,34,98,34,58,34,99,34,125,44,34,104,97,115,104,34,58,34,55,99,101,48,52,98,48,52,100,51,101,51,53,55,54,49,101,100,98,55,54,57,56,54,56,100,53,98,102,52,48,98,52,97,97,100,52,52,49,57,34,125,93,125,26,12,8,220,255,246,247,5,16,192,149,167,180,3,26,36,97,102,56,57,54,55,102,52,45,100,51,51,53,45,52,54,57,97,45,98,56,98,56,45,55,54,101,51,99,57,97,49,97,97,49,56]}}
    let result = [];
    let res = await iterator.next();
    console.log(res)
    while (!res.done) {
      if (res.value) {
        const milliseconds = (res.value.timestamp.seconds.low + ((res.value.timestamp.nanos / 1000000) / 1000)) * 1000;
        // console.info(`found state update with value:}` + );
        console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
        let obj = JSON.parse(res.value.value.toString('utf8'));
        obj.timestamp = new Date(milliseconds)
        result.push(obj);
      }
      res = await iterator.next();
    }
    await iterator.close();
    return result;  
  }


  async getCurrentUser(ctx) {

    let id = [];
    id.push(ctx.clientIdentity.getID());
    var begin = id[0].indexOf("/OU=");
    var end = id[0].lastIndexOf("::/C=");
    let userid = id[0].substring(begin, end);
    return userid;
    //  check user id;  if admin, return type = admin;
    //  else return value set for attribute "type" in certificate;
    // if (userid == "admin") {
    //     return userid;
    // }
  }

  /**
  * Query by the main objects in this app: ballot, election, votableItem, and Voter. 
  * Return all key-value pairs of a given type. 
  *
  * @param {Context} ctx the transaction context
  * @param {String} objectType the type of the object - should be either ballot, election, votableItem, or Voter
  */
  async queryByApplication(ctx, application) {

    let queryString = {
      selector: {
        application:application
      }
    };
    
    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
    return queryResults;

  }

  async queryByKey(ctx, key) {

    let queryString = {
      selector: {
        key:key
      }
    };
    
    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
    return queryResults;

  }
}



module.exports = MyAssetContract;
