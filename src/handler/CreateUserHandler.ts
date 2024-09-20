import middy, { MiddyfiedHandler } from "@middy/core";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import inputOutputLogger from "@middy/input-output-logger";
import { ApiGatewayParsedEvent, validatorRequest } from "tmet-core";
import { UserService } from "../service/UserService";
import * as CORE from "tmet-core";
import { UserProfile } from "../shared/model/UserProfile";
// Schemas
import createValidator from "src/shared/schema/CreateUserValidator.json";
import userProfile from "src/shared/schema/UserProfileSchema.json";

const instanceUser = new UserService();
const HANDLER: MiddyfiedHandler = middy(
  (event: ApiGatewayParsedEvent<UserProfile>) => instanceUser.createUser(event)
)
  .use(inputOutputLogger())
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(
    validatorRequest({
      eventSchema: createValidator,
      refSchemas: [userProfile],
    })
  )
  .use(CORE.apiGtwEnableCors)
  .use(CORE.apiGtwErrorResponse())
  .use(CORE.apiGtwParsedResponse(CORE.StatusCodeEnum.Created));
// http-event-normalizer for path and query params

export { HANDLER };
