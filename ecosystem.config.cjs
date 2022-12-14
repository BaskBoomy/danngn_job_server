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
      }
    }]
  };
