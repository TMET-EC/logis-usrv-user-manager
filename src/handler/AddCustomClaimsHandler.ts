import middy, { MiddyfiedHandler } from "@middy/core";
import { UserService } from "../service/UserService";
import inputOutputLogger from "@middy/input-output-logger";
import { PreTokenGenerationV2TriggerEvent } from "aws-lambda";

const instanceUser = new UserService();
const HANDLER: MiddyfiedHandler = middy(
  (event: PreTokenGenerationV2TriggerEvent) =>
    instanceUser.addCustomClaims(event)
).use(inputOutputLogger());

export { HANDLER };
