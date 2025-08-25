import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default
} from "sequelize-typescript";

import Tenant from "./Tenant";

export type MetricType = 
  | "response_time"
  | "resolution_rate" 
  | "flow_effectiveness"
  | "campaign_roi"
  | "user_activity"
  | "contact_engagement"
  | "ticket_volume"
  | "ai_usage"
  | "api_usage"
  | "custom";

export type MetricPeriod = "hourly" | "daily" | "weekly" | "monthly" | "yearly";

@Table
class AnalyticsMetric extends Model<AnalyticsMetric> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Tenant)
  @AllowNull(false)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @AllowNull(false)
  @Column(DataType.ENUM(
    "response_time",
    "resolution_rate", 
    "flow_effectiveness",
    "campaign_roi",
    "user_activity",
    "contact_engagement",
    "ticket_volume",
    "ai_usage",
    "api_usage",
    "custom"
  ))
  metricType: MetricType;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  value: number;

  @Column
  unit: string;

  @AllowNull(false)
  @Default("daily")
  @Column(DataType.ENUM("hourly", "daily", "weekly", "monthly", "yearly"))
  period: MetricPeriod;

  @AllowNull(false)
  @Column(DataType.DATE)
  periodStart: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  periodEnd: Date;

  @Default({})
  @Column(DataType.JSON)
  dimensions: Record<string, any>;

  @Default({})
  @Column(DataType.JSON)
  metadata: Record<string, any>;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  // Helper method to calculate metric percentage change
  static async calculatePercentageChange(
    tenantId: number,
    metricType: MetricType,
    currentPeriod: { start: Date; end: Date },
    previousPeriod: { start: Date; end: Date }
  ): Promise<number | null> {
    const currentMetric = await AnalyticsMetric.findOne({
      where: {
        tenantId,
        metricType,
        periodStart: currentPeriod.start,
        periodEnd: currentPeriod.end
      }
    });

    const previousMetric = await AnalyticsMetric.findOne({
      where: {
        tenantId,
        metricType,
        periodStart: previousPeriod.start,
        periodEnd: previousPeriod.end
      }
    });

    if (!currentMetric || !previousMetric || previousMetric.value === 0) {
      return null;
    }

    return ((currentMetric.value - previousMetric.value) / previousMetric.value) * 100;
  }
}

export default AnalyticsMetric;