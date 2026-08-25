import MarkdownModel from "./markdown.model.js";

class MarkdownService {
  static async getMarkdown(filters) {
    return await MarkdownModel.getMarkdown(filters);
  }

  static async getMarkdownByProductId(productId) {
    return await MarkdownModel.getMarkdownByProductId(productId);
  }

  static async getMarkdownSummary() {
    return await MarkdownModel.getMarkdownSummary();
  }
}

export default MarkdownService;