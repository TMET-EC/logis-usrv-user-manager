import {
  AdminAddUserToGroupCommandInput,
  AdminCreateUserCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import * as console from "console";
import { format, fromUnixTime } from "date-fns";
import { get } from "lodash";
import * as process from "process";
import { ApiGatewayParsedEvent, TmetError } from "tmet-core";
import * as CORE from "tmet-core";
import { UserGroupsEnum } from "../shared/infrastructure/UserGroupsEnum";
import { UserProfile } from "../shared/model/UserProfile";

export class UserService {
  private readonly cognitoGtw: CORE.CognitoGateway;

  constructor() {
    this.cognitoGtw = new CORE.CognitoGateway();
  }

  public async createUser(
    event: ApiGatewayParsedEvent<UserProfile>
    // _context: Context
  ): Promise<{ message: string; [key: string]: any }> {
    // if (event.body.username === "darkhood")
    //   // throw new Error();
    //   throw new CORE.TmetError({
    //     message: "Usuario existe",
    //     statusCode: CORE.StatusCodeEnum.Conflict,
    //   });
    //
    // return { message: "Hello world new tmet" };
    const user: UserProfile = event.body;
    try {
      await this._createCognitoUser(user);
      await this._addUserToGroup(user.username, user.type);
      return { message: "Usuario creado exitosamente" };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private async _createCognitoUser(user: UserProfile): Promise<boolean> {
    try {
      const newUser: AdminCreateUserCommandInput = {
        UserPoolId: process.env.POOL_ID,
        Username: user.username,
        DesiredDeliveryMediums: ["EMAIL"],
        UserAttributes: [
          {
            Name: "email",
            Value: user.email,
          },
          {
            Name: "phone_number",
            Value: user.phoneNumbers[0].number,
          },
          {
            Name: "gender",
            Value: user.gender,
          },
          {
            Name: "birthdate",
            Value: format(fromUnixTime(user.birthdate), "yyyy-MM-dd"),
          },
          {
            Name: "given_name",
            Value: user.firstName,
          },
          {
            Name: "family_name",
            Value: user.lastName,
          },
          {
            Name: "custom:status",
            Value: "active",
          },
          {
            Name: "custom:role",
            Value: "Coordinator",
          },
          {
            Name: "email_verified",
            Value: "true",
          },
        ],
      };
      await this.cognitoGtw.createUser(newUser);
    } catch (e) {
      if (get(e, "name") === "UsernameExistsException")
        throw new TmetError({
          statusCode: 409,
          message:
            "El nombre de usuario o email ingresado ya se encuentra registrado",
        });
      throw new TmetError({
        statusCode: 500,
        message: "Error al crear usuario",
      });
    }
    return true;
  }

  private async _addUserToGroup(
    username: string,
    type: string
  ): Promise<boolean> {
    try {
      const group: string = this.getUserGroup(type);
      const request: AdminAddUserToGroupCommandInput = {
        UserPoolId: process.env.POOL_ID,
        Username: username,
        GroupName: group,
      };
      await this.cognitoGtw.assignUserGroup(request);
    } catch (e) {
      console.log(e);
      throw new TmetError({
        statusCode: 500,
        message: "Error al asignar usuario",
      });
    }

    return true;
  }

  private getUserGroup(type: string): string {
    switch (type) {
      case "admin":
        return UserGroupsEnum.admin;
      case "coordinator":
        return UserGroupsEnum.coordinator;
      default:
        return "";
    }
  }
}
