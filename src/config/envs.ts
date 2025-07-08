import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  MP_SECRET: string;
}

const envsSchema = joi
  .object<EnvVars>({
    PORT: joi.number().required(),
    MP_SECRET: joi.string().required(),
  })
  .unknown(true); // Allow additional properties

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envsVars: EnvVars = value;

export const envs = {
  PORT: envsVars.PORT,
  MP_SECRET: envsVars.MP_SECRET,
};
