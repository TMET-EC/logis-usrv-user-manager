import middy, { MiddyfiedHandler } from "@middy/core";
import { UserService } from "../service/UserService";
import inputOutputLogger from "@middy/input-output-logger";
import { Context, PreTokenGenerationV2TriggerEvent } from "aws-lambda";

const instanceUser = new UserService();
const HANDLER: MiddyfiedHandler = middy(
  (event: PreTokenGenerationV2TriggerEvent, context: Context) =>
    instanceUser.addCustomClaims(event, context)
).use(inputOutputLogger());

export { HANDLER };
