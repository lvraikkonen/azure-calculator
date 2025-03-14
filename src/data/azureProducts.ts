import { AzureProduct, AzureSolution } from '../types';

// Azure产品列表
export const azureProducts: AzureProduct[] = [
  { id: 'app-service', name: 'App Service', description: '托管Web应用、REST API和移动后端', price: 13.14, category: 'compute' },
  { id: 'sql-database', name: 'SQL Database', description: '托管的关系型数据库服务', price: 15.55, category: 'database' },
  { id: 'storage', name: 'Storage Account', description: '高性能、高可用的云存储', price: 5.23, category: 'storage' },
  { id: 'virtual-machine', name: 'Virtual Machine', description: '可定制的云服务器', price: 25.67, category: 'compute' },
  { id: 'cdn', name: 'Content Delivery Network', description: '全球内容分发网络', price: 8.76, category: 'networking' },
  { id: 'blob-storage', name: 'Blob Storage', description: '用于存储非结构化数据的服务', price: 6.54, category: 'storage' },
  { id: 'data-factory', name: 'Data Factory', description: '数据集成服务', price: 12.87, category: 'data' },
  { id: 'data-lake', name: 'Data Lake', description: '大数据分析存储服务', price: 17.32, category: 'data' },
  { id: 'hdinsight', name: 'HDInsight', description: '云中的开源分析服务', price: 21.45, category: 'data' },
  { id: 'cosmos-db', name: 'Cosmos DB', description: '全球分布式多模型数据库', price: 28.93, category: 'database' },
  { id: 'kubernetes', name: 'Kubernetes Service', description: '托管的Kubernetes服务', price: 19.44, category: 'compute' },
  { id: 'load-balancer', name: 'Load Balancer', description: '分发网络流量的服务', price: 9.12, category: 'networking' }
];

// 预设方案
export const aiSolutions: Record<string, AzureSolution> = {
  'web-small': {
    name: 'Web 应用基础解决方案',
    description: '适合小型Web应用的基础云服务组合',
    products: [
      { id: 'app-service', name: 'App Service', quantity: 1 },
      { id: 'sql-database', name: 'SQL Database', quantity: 1 },
      { id: 'storage', name: 'Storage Account', quantity: 1 }
    ]
  },
  'web-medium': {
    name: 'Web 应用标准解决方案',
    description: '适合中型Web应用的标准云服务组合',
    products: [
      { id: 'app-service', name: 'App Service', quantity: 2 },
      { id: 'sql-database', name: 'SQL Database', quantity: 1 },
      { id: 'storage', name: 'Storage Account', quantity: 1 },
      { id: 'cdn', name: 'Content Delivery Network', quantity: 1 }
    ]
  },
  'data-small': {
    name: '数据处理基础解决方案',
    description: '适合小型数据处理需求的基础云服务组合',
    products: [
      { id: 'blob-storage', name: 'Blob Storage', quantity: 1 },
      { id: 'data-factory', name: 'Data Factory', quantity: 1 }
    ]
  },
  'data-medium': {
    name: '数据处理标准解决方案',
    description: '适合中型数据处理需求的标准云服务组合',
    products: [
      { id: 'blob-storage', name: 'Blob Storage', quantity: 1 },
      { id: 'data-factory', name: 'Data Factory', quantity: 1 },
      { id: 'data-lake', name: 'Data Lake', quantity: 1 },
      { id: 'hdinsight', name: 'HDInsight', quantity: 1 }
    ]
  }
};