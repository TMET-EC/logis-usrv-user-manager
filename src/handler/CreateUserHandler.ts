import middy, { MiddyfiedHandler } from "@middy/core";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import inputOutputLogger from "@middy/input-output-logger";
import { ApiGatewayParsedEvent } from "tmet-core";
import { UserService } from "../service/UserService";
import * as CORE from "tmet-core";
import { UserProfile } from "../shared/model/UserProfile";

const instanceUser = new UserService();
const HANDLER: MiddyfiedHandler = middy(
  (event: ApiGatewayParsedEvent<UserProfile>) => instanceUser.createUser(event)
)
  .use(inputOutputLogger())
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(CORE.apiGtwEnableCors)
  .use(CORE.apiGtwErrorResponse())
  .use(CORE.apiGtwParsedResponse(CORE.StatusCodeEnum.Created));
// http-event-normalizer for path and query params

export { HANDLER };
