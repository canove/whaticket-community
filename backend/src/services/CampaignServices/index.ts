import { logger } from "../../utils/logger";
import CampaignProcessorService from "./CampaignProcessorService";
import CampaignQueueService from "./CampaignQueueService";

class CampaignBootstrap {
  async initialize(): Promise<void> {
    try {
      logger.info("Initializing Campaign Services...");

      // Start campaign processor
      await CampaignProcessorService.start();
      
      logger.info("Campaign Services initialized successfully");
    } catch (error) {
      logger.error("Error initializing Campaign Services:", error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      logger.info("Shutting down Campaign Services...");

      // Stop campaign processor
      await CampaignProcessorService.stop();
      
      // Close queue connections
      await CampaignQueueService.close();

      logger.info("Campaign Services shut down successfully");
    } catch (error) {
      logger.error("Error shutting down Campaign Services:", error);
      throw error;
    }
  }
}

export default new CampaignBootstrap();