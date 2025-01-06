import Distribution from "../../models/Distribution";

interface DistributionData {
  queueId: string;
  userIds: string[];
  current_user: string;
  is_active?: boolean;
}

const CreateOrUpdateDistributionService = async ({
  queueId,
  userIds,
  current_user,
  is_active,
}: DistributionData): Promise<void> => {
  try {
    const existingDistribution = await Distribution.findOne({
      where: {
        queue_id: queueId,
      },
    });

    if (existingDistribution) {
      await existingDistribution.update({ is_active });
      console.log("Distribuição atualizada com sucesso!");
    } else {
      const distribution = {
        queue_id: queueId,
        user_ids: userIds,
        current_user,
        is_active,
      };

      await Distribution.create(distribution);
      console.log("Nova distribuição criada com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao criar ou atualizar distribuição:", error);
    throw new Error("Erro ao criar ou atualizar distribuição");
  }
};

export default CreateOrUpdateDistributionService;