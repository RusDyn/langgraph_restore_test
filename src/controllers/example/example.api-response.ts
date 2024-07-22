import { Property } from '@tsed/schema';

export class ExampleApiResponse {
  @Property()
  readonly id: string;

  @Property()
  readonly name: string;

  @Property()
  readonly status: string;

  @Property()
  readonly created: string;

  @Property()
  readonly updated: string;

  constructor(id: string, name: string, status: string, created: string, updated: string) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.created = created;
    this.updated = updated;
  }

  public static fromEntity(
    entity: Pick<any, 'uuid' | 'description' | 'lastStatus' | 'createdAt' | 'updatedAt'>
  ): ExampleApiResponse {
    return new ExampleApiResponse(
      entity.uuid,
      entity.description,
      entity.lastStatus,
      entity.createdAt!.toISOString(),
      entity.updatedAt!.toISOString()
    );
  }
}
