#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROTO_DIR = path.join(__dirname, '..', 'libs', 'proto');
const TYPES_DIR = path.join(__dirname, '..', 'libs', 'types', 'src');

// Ensure types directory exists
if (!fs.existsSync(TYPES_DIR)) {
  fs.mkdirSync(TYPES_DIR, { recursive: true });
}

// Get all proto files
const protoFiles = fs.readdirSync(PROTO_DIR).filter(file => file.endsWith('.proto'));

console.log('🚀 Compiling proto files for NestJS...');

protoFiles.forEach(protoFile => {
  const protoPath = path.join(PROTO_DIR, protoFile);
  const serviceName = path.basename(protoFile, '.proto');
  
  console.log(`📦 Compiling ${protoFile}...`);
  
  try {
    // Generate TypeScript types using ts-proto with NestJS compatibility
    const command = [
      'npx protoc',
      `--plugin=./node_modules/.bin/protoc-gen-ts_proto`,
      `--ts_proto_out=${TYPES_DIR}`,
      `--ts_proto_opt=nestjs=true,esModuleInterop=true,env=node,forceLong=number,useOptionals=messages`,
      `--proto_path=${PROTO_DIR}`,
      protoPath
    ].join(' ');
    
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ Successfully compiled ${protoFile}`);
  } catch (error) {
    console.error(`❌ Error compiling ${protoFile}:`, error.message);
    process.exit(1);
  }
});

console.log('🎉 All proto files compiled successfully!');

// Generate index file for types
const indexContent = protoFiles
  .map(file => {
    const serviceName = path.basename(file, '.proto');
    return `export * from './${serviceName}';`;
  })
  .join('\n');

fs.writeFileSync(path.join(TYPES_DIR, 'index.ts'), indexContent);
console.log('📝 Generated types index file');
