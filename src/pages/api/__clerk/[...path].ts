import { type NextApiRequest, type NextApiResponse } from "next";
import { proxyClerkRequest } from "../../../lib/clerk-proxy";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyClerkRequest(req, res, "/__clerk");
}
