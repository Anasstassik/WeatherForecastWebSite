import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        server: {
            proxy: {
                "/api/cities": {
                    target: "http://dataservice.accuweather.com",
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) =>
                        path.replace(
                            /^\/api\/cities/,
                            "/locations/v1/cities/search"
                        ) + `&apikey=${env.VITE_API_KEY}`,
                },
                "/api/weather": {
                    target: "http://dataservice.accuweather.com",
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) =>
                        path.replace(
                            /^\/api\/weather\//,
                            "/forecasts/v1/daily/5day/"
                        ) + `?apikey=${env.VITE_API_KEY}`,
                },
            },
        },
    };
});
