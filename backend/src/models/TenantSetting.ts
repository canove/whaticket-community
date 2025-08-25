import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  DataType
} from "sequelize-typescript";
import Tenant from "./Tenant";

@Table
class TenantSetting extends Model<TenantSetting> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  key: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  value: string;

  @Column
  description: string;

  @Column(DataType.ENUM("string", "number", "boolean", "json"))
  type: string;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  get parsedValue(): any {
    try {
      switch (this.type) {
        case "number":
          return parseFloat(this.value);
        case "boolean":
          return this.value === "true";
        case "json":
          return JSON.parse(this.value);
        default:
          return this.value;
      }
    } catch {
      return this.value;
    }
  }

  set parsedValue(value: any) {
    switch (this.type) {
      case "json":
        this.value = JSON.stringify(value);
        break;
      default:
        this.value = String(value);
    }
  }
}

export default TenantSetting;