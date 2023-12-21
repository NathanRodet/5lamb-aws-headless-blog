
// A simple token-based authorizer example to demonstrate how to use an authorization token 
// to allow or deny a request. In this example, the caller named 'user' is allowed to invoke 
// a request if the client-supplied token value is 'allow'. The caller is not allowed to invoke 
// the request if the token value is 'deny'. If the token value is 'unauthorized' or an empty
// string, the authorizer function returns an HTTP 401 status code. For any other token value, 
// the authorizer returns an HTTP 500 status code. 
// Note that token values are case-sensitive.
import jwt from "jsonwebtoken";

const signature_key = "secret1Signature2Key3";

export const handler = function (event, context, callback) {
  let token = event.authorizationToken;

  try {
    const decodedToken = jwt.verify(token, signature_key);
    // Token is valid, generate an 'Allow' policy

    // TO SCOPE THE POLICY WITH RESSOURCES MODIFY THE FOLLOWING LINE WITH THIS EXAMPLE
    //   const policy = generatePolicy(decodedToken.name, 'Allow', 'users/*');
    const policy = generatePolicy(decodedToken.name, 'Allow', '*');
    policy.context = { name: decodedToken.name, role: decodedToken.role };


    callback(null, policy);
  } catch (error) {
    // Token is invalid or expired
    if (error.name === 'TokenExpiredError') {
      callback("Unauthorized"); // Return a 401 Unauthorized response
    } else {
      callback("Error: Invalid token"); // Return a 500 Invalid token response
    }
  }
};

// Help function to generate an IAM policy
const generatePolicy = function (principalId, effect, resource) {
  let authResponse = {};

  authResponse.principalId = principalId;
  if (effect && resource) {
    let policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    let statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
}