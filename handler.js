'use strict';

const acorn = require('acorn')
const astring = require('astring')
const assert = require('assert')

module.exports.testCase = async event => {
  let body = JSON.parse(event.body);
  let data = body.code

  let challenge = body.challenge
  let skeletonCode = acorn.parse(challenge.skeletonCode).body
  let nodeSkeleton = skeletonCode.find(node => node.type === 'FunctionDeclaration')
  let functionName = nodeSkeleton.id.name
  let testCase = challenge.testCase
  
  
  
  let astFunction = acorn.parse(data).body
  const fnNode = astFunction.find(node => node.type === 'FunctionDeclaration' && node.id.name === functionName )

  if (!fnNode){
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Origin-Credentials": true,
      },
      body: JSON.stringify(
        {
          message: 'Invalid Function Name',
          input: false,
        },
        null,
        2
      ),
    };
  }

  let params = fnNode.params.map(param => param.name)
  
  const logic = new Function(...params, astring.generate(fnNode.body))

  try{
    let result = []

    for (let i = 0; i < testCase.length; i++){
      let testInput = testCase[i].input
      let test = logic(...testInput)
      result.push(test);
    }
  
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Origin-Credentials": true,
      },
      body: JSON.stringify(
        {
          message: 'Result TestCase',
          input: result,
        },
        null,
        2
      ),
    };
  }catch {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Origin-Credentials": true,
      },
      body: JSON.stringify(
        {
          message: 'Invalid Logic',
          input: false,
        },
        null,
        2
      ),
    };
  }

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
