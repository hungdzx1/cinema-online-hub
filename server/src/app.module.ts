import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/Database.module';
import { MailModule } from './mail/mail.module';

// ── Các module chức năng ──────────────────────────────
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GenresModule } from './modules/genres/genres.module';
import { MoviesModule } from './modules/movies/movies.module';
import { EpisodesModule } from './modules/episodes/episodes.module';
import { CommentsModule } from './modules/comments/comments.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';
import { WatchHistoryModule } from './modules/watch-history/watch-history.module';
import { ErrorReportsModule } from './modules/error-reports/error-reports.module';
import { CountriesModule } from './modules/countries/countries.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(__dirname, '..', '.env'),
    }),

    // Cache toàn cục - lưu RAM, TTL 60 giây
    CacheModule.register({
      isGlobal: true,
      ttl: 60000,
    }),

    // Rate Limiting - chống spam/brute-force
    // Trong 60 giây, 1 IP chỉ được gọi tối đa 20 request
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20,
      },
    ]),

    DatabaseModule,
    AuthModule,
    UsersModule,
    GenresModule,
    MoviesModule,
    EpisodesModule,
    CommentsModule,
    RatingsModule,
    FavoritesModule,
    WatchlistModule,
    WatchHistoryModule,
    ErrorReportsModule,
    CountriesModule,
    NotificationsModule,
    AdminModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Áp dụng Rate Limiting cho TOÀN BỘ API tự động
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
