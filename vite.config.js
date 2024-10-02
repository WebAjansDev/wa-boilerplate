import { resolve } from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';

// Function to load JSON data dynamically from data.json
function loadData() {
    let data = {};
    try {
        data = JSON.parse(fs.readFileSync(resolve(__dirname, 'src/data/data.json'), 'utf-8'));
        console.log('Loaded Data:', data); // Log the loaded data
    } catch (error) {
        console.error('Error loading JSON data:', error);
    }
    return data; // Return the loaded data
}

// Function to override Handlebars and dynamically load data each time
function handlebarsOverride() {
    const partialDirectory = resolve(__dirname, 'src/components');
    console.log('Partial directory:', partialDirectory);  // Ensure the path is correct

    return handlebars({
        partialDirectory, // Ensure partials are loaded from the correct directory
        helpers: {
            json: (context) => JSON.stringify(context, null, 2), // Custom helper to stringify JSON
        },
        context: () => loadData(), // Dynamically load the data every time Handlebars is processed
    });
}

// Helper to get HTML files
function getHtmlFiles(dir) {
    return fs.readdirSync(dir)
        .filter(file => file.endsWith('.html'))
        .reduce((acc, file) => {
            const filePath = resolve(dir, file);
            acc[file.replace('.html', '')] = filePath; // Use filename without .html as the key
            return acc;
        }, {});
}

// Plugin to post-process HTML after build
function addDotSlashToAssetPaths() {
    return {
        name: 'add-dot-slash-to-asset-paths',
        apply: 'build',
        enforce: 'post',
        transformIndexHtml(html) {
            return html.replace(/"(\/?assets\/[^"]+)"/g, '"./$1"'); // Add './' before assets paths
        }
    };
}

// Custom plugin to watch data.json and trigger HMR
function watchDataPlugin() {
    return {
        name: 'watch-data-json', // Name of the plugin
        configureServer(server) {
            const jsonFilePath = resolve(__dirname, 'src/data/data.json');

            // Watch the JSON file for changes
            server.watcher.add(jsonFilePath);

            server.watcher.on('change', (path) => {
                if (path === jsonFilePath) {
                    console.log('data.json changed, reloading...');
                    server.ws.send({ type: 'full-reload' }); // Trigger full reload
                }
            });
        }
    };
}

export default defineConfig({
    base: './', // Set the base path to the current directory
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'), // Alias for 'src'
        },
    },
    root: resolve(__dirname, 'src'), // Set root to src
    build: {
        outDir: resolve(__dirname, 'build'), // Place the build folder inside the main directory
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'src/pages/index.html'), // Ensure index.html is set explicitly
                ...getHtmlFiles(resolve(__dirname, 'src/pages')),
            },
            output: {
                assetFileNames: 'assets/[name].[hash][extname]',
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
            }
        }
    },
    plugins: [
        handlebarsOverride(), // Dynamically load data every time Handlebars is processed
        watchDataPlugin(), // Add custom plugin to watch data.json
    ],
    server: {
        watch: {
            usePolling: true, // Use polling to ensure file changes are detected
        },
        host: true,
        strictPort: true,
        port: 5173,
    },
});
