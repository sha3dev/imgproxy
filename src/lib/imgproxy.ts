/**
 * imports: externals
 */

import createHmac from "create-hmac";
import path from "path";

/**
 * consts
 */

/**
 * export
 */

export default class Imgproxy {
  /**
   * constructor
   */
  constructor(
    private options: { baseUrl: string; key: string; salt: string; presets: string[]; extension?: string; allowUnsigned?: boolean }
  ) {}

  /**
   * private static : methods
   */

  private static urlSafeBase64(url: Buffer | string) {
    return Buffer.from(url).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  }

  private static hexDecode(hex: string) {
    return Buffer.from(hex, "hex");
  }

  /**
   * private : methods
   */

  private sign(target: string) {
    const hmac = createHmac("sha256", Imgproxy.hexDecode(this.options.key));
    hmac.update(Imgproxy.hexDecode(this.options.salt));
    hmac.update(target);
    return Imgproxy.urlSafeBase64(hmac.digest());
  }

  /**
   * public : methods
   */

  getPresetsUrls(url: string) {
    const result: Record<string, string> = {};
    const extname = this.options.extension || path.extname(url);
    this.options.presets.forEach((preset) => {
      const safeUrl = Imgproxy.urlSafeBase64(url);
      const safePath = `/${preset}/${safeUrl}${extname}`;
      const signature = this.sign(safePath);
      result[preset] = `${this.options.baseUrl}/${signature}${safePath}`;
    });
    return result;
  }
}
