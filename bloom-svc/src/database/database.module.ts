import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { createPool } from './db';

export const PG_POOL = Symbol('PG_POOL');

@Global()
@Module({
  providers: [{ provide: PG_POOL, useFactory: createPool }],
  exports: [PG_POOL],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}