module.exports = {
    apps : [{
      name: "Danngn-Job-Server",
      script:"dist/app.js",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production",
        JWT_SECRET:"5NIjtfcI@aEo4WInK!3@3H1Xyn32kXLm",
        JWT_EXPIRES_SEC:172800,
        REDIS_USERNAME:"default",
        REDIS_HOST:"redis-18359.c302.asia-northeast1-1.gce.cloud.redislabs.com",
        REDIS_PORT:18359,
        REDIS_PASSWORD:"cZhyUHSanAizXEfvIy4WQEZgPvR0Ukwo",
        NAVER_CLOUD_SERVICE_ID:"ncp:sms:kr:259883044652:authorize_user",
        NAVER_CLOUD_SECRET_KEY:"tWjNonuWy2edBPvuBiDe5mxCqXXlGiSfVKTeByu9",
        NAVER_CLOUD_ACCESS_KEY:"DtNwqeAqYedhjQ8Uebjm",
        CORS_ALLOW_ORIGIN:"http://localhost:3000",
        DB_HOST:"mongodb+srv://whdgurtpqms:ejsvk9773!@cluster0.kwnp9ow.mongodb.net/?retryWrites=true&w=majority",
        PORT:8080,
        KAKAO_REST_API_KEY:"32a73037ef86ec42aef847f69e8e94b5",
        COORDINATE_CONVERT_WGS84:"+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
        COORDINATE_CONVERT_GRS80:"+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs",
      }
    }]
  };