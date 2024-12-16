// import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm"; // ES Modules import
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm"); // CommonJS import

module.exports.slsBuild = async ({ options, resolveVariable }) => {
  const prefix = await resolveVariable("self:custom.prefix");
  const region = await resolveVariable(
    "opt:region, self:provider.region, 'us-east-1'"
  );

  const client = new SSMClient({ region });
  const input = {
    Name: `${prefix}/SLS_BUILD`,
  };
  const command = new GetParameterCommand(input);
  const response = await client.send(command);
  const res = JSON.parse(response.Parameter.Value);
  // const stage = await resolveVariable('sls:stage');
  // const region = await resolveVariable('opt:region, self:provider.region, "us-east-1"');
  // const service = await resolveVariable('self:service');
  return {
    fromEmail: res.fromEmail,
    emailSesArn: res.emailSesArn,
    customClaimsArn: res.customClaimsArn,
    certificateArn: res.certificateArn,
  };
};

module.exports.logRetentionInDays = async ({ resolveVariable }) => {
  const stage = await resolveVariable("sls:stage");
  const retentionByStage = {
    dev: 7,
    qa: 7,
    prod: 3653,
  };
  return retentionByStage[stage];
};
