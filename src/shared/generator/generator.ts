import { writeFileSync, readdirSync, readFileSync } from "fs";
import { compileFromFile } from "json-schema-to-typescript";
import * as Path from "path";

async function generate() {
  const schemaDir = Path.join(__dirname, "../schema");
  const files = readdirSync(schemaDir);
  console.log(files);
  for (const file of files) {
    const name = Path.basename(file, "Schema.json");
    if (file.includes("Schema")) {
      const compiledFile: string = await compileFromFile(
        `./src/shared/schema/${name}Schema.json`,
        {
          cwd: "./src/shared/schema",
          // declareExternallyReferenced: true,
          $refOptions: {
            resolve: {
              external: true,
              file: {
                read: (file: any) => {
                  const externalName: string = file.url.replace("/tmet/", "");
                  if (file.url.includes(".json")) return "";
                  const jsonRes = readFileSync(
                    `./src/shared/schema/${externalName}.json`,
                    "utf8"
                  );
                  return jsonRes;
                },
              },
            },
          },
        }
      );
      writeFileSync(`./src/shared/model/${name}.d.ts`, compiledFile);
    }
  }
}

generate()
  .then(() => console.log("Success.!"))
  .catch((e) => console.log(e.message));
