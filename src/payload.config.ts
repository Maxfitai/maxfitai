// payload.config.ts
import dotenv from 'dotenv'
dotenv.config({ path: '.env' }) // <-- load .env first thing

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

// Collections
import { Admins } from './collections/Admins'
import { Users } from './collections/Users'
import { Coaches } from './collections/Coaches'
import { Plans } from './collections/Plans'
import { OTPVerifications } from './collections/OTPVerification'
import { Feedbacks } from './collections/Feedbacks'
import { FitnessPrograms } from './collections/FitnessProgram'
import { Recipes } from './collections/Recipes'
import { WorkoutLibrary } from './collections/WorkoutLibrary'
import { Enrollments } from './collections/Enrollments'
import { Conversations } from './collections/Conversations'
import { Messages } from './collections/Messages'
import { Notifications } from './collections/Notifications'
// import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Safety check
const secret = process.env.PAYLOAD_SECRET
if (!secret) {
  throw new Error('❌ PAYLOAD_SECRET is missing. Set it in your .env file!')
}

const dbUrl = process.env.DATABASE_URI
if (!dbUrl) {
  throw new Error('❌ DATABASE_URI is missing. Set it in your .env file!')
}

export default buildConfig({
  secret, // Must exist, loaded from .env
  serverURL: process.env.NEXT_PUBLIC_APP_URL || '',
  cors: {
    origins: [
      process.env.NEXT_PUBLIC_APP_URL || 'https://maxfitai.com',
      'https://admin.maxfitai.com',
    ],
    headers: ['Content-Type', 'Authorization'],
  },
  // payload.config.ts
  admin: {
    user: Admins.slug,
    importMap: {
      baseDir: path.resolve(dirname, '..'),  // ← back to project root (one level up from /src)
    },
    components: {
      graphics: {
        Logo: '/src/components/admin/CustomLogo#CustomLogo',   // ← keep /src/ prefix
        Icon: '/src/components/admin/CustomIcon#CustomIcon',
      },
    },
  },
  cookiePrefix: 'admin', // Use separate cookie name for admin auth
  collections: [
    Users,
    Admins,
    Coaches,
    Plans,
    FitnessPrograms,
    OTPVerifications,
    Feedbacks,
    Recipes,
    WorkoutLibrary,
    Enrollments,
    Conversations,
    Messages,
    Notifications,
  ],
  editor: lexicalEditor(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: dbUrl,
  }),
  plugins: [payloadCloudPlugin()],
})
