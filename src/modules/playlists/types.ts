import { inferRouterOutputs } from "@trpc/server"; // mendeteksi output dari router
import { AppRouter } from "@/trpc/routers/_app"; // mengimpor AppRouter dari file _app.ts

export type PlaylistGetManyOutput = inferRouterOutputs<AppRouter>["playlists"]["getMany"]; // mendefinisikan tipe output dari prosedur getMany pada router playlists