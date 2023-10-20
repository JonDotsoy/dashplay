import { APIRoute, EndpointHandler } from "astro";
import { userInfo } from "os"
import { Store, atom } from "nanostores"
import tickStore from "../components/store/tick-store";
import { Handler } from "express";

export const get: Handler = async (req, res) => {
  res.json({ ok: true })
}
