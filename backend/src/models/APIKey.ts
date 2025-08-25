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
  Default,
  Unique
} from "sequelize-typescript";

import Tenant from "./Tenant";

export interface APIKeyPermission {
  resource: string;
  actions: string[];
}

@Table
class APIKey extends Model<APIKey> {
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
  @Column
  name: string;

  @AllowNull(false)
  @Unique
  @Column
  key: string;

  @AllowNull(false)
  @Default([])
  @Column(DataType.JSON)
  permissions: APIKeyPermission[];

  @AllowNull(false)
  @Default(1000)
  @Column
  rateLimit: number;

  @AllowNull(false)
  @Default(3600)
  @Column
  rateLimitWindow: number;

  @AllowNull(false)
  @Default(true)
  @Column
  isActive: boolean;

  @Column(DataType.DATE)
  lastUsedAt: Date;

  @AllowNull(false)
  @Default(0)
  @Column
  usageCount: number;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.DATE)
  expiresAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  // Helper method to check if key has permission
  hasPermission(resource: string, action: string): boolean {
    return this.permissions.some(permission => 
      permission.resource === resource && 
      (permission.actions.includes(action) || permission.actions.includes('*'))
    );
  }

  // Helper method to check if key is expired
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }
}

export default APIKey;