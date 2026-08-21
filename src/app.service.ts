import { Injectable } from '@nestjs/common';
import * as os from 'os';

export interface PipelineStage {
  name: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'PENDING';
  duration: string;
}

export interface PipelineRun {
  id: string;
  buildNumber: number;
  branch: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED';
  startedAt: string;
  duration: string;
  stages: PipelineStage[];
  logs: string[];
}

@Injectable()
export class AppService {
  private startTime = Date.now();
  private pipelineHistory: PipelineRun[] = [
    {
      id: 'pipe-105',
      buildNumber: 105,
      branch: 'main',
      commitHash: '2d85f57',
      commitMessage: 'chore: update application port from 3000 to 5173 in Jenkinsfile',
      author: 'mahankalibhanubabu',
      status: 'SUCCESS',
      startedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      duration: '1m 45s',
      stages: [
        { name: 'Clone Repo', status: 'SUCCESS', duration: '8s' },
        { name: 'Build Docker Image', status: 'SUCCESS', duration: '48s' },
        { name: 'Stop & Remove Previous Container', status: 'SUCCESS', duration: '5s' },
        { name: 'Run Docker Container', status: 'SUCCESS', duration: '12s' },
        { name: 'Send Email Notification', status: 'SUCCESS', duration: '2s' },
      ],
      logs: [
        '[Jenkins] Starting Pipeline on agent "any"...',
        '[Clone Repo] git clone https://github.com/mahankalibhanubabu/full-CICD.git',
        '[Clone Repo] Checked out revision 2d85f57',
        '[Build Docker Image] docker build -t nestjs-image .',
        '[Build Docker Image] Successfully tagged nestjs-image:latest',
        '[Stop & Remove] docker stop nestjs-app || true',
        '[Run Docker] docker run -d -p 3000:3000 --name nestjs-app nestjs-image',
        '[Notification] Email notification dispatched to bobbybhanumahankali@gmail.com',
        '[Jenkins] Pipeline completed successfully in 1m 45s.',
      ],
    },
    {
      id: 'pipe-104',
      buildNumber: 104,
      branch: 'main',
      commitHash: 'ad97690',
      commitMessage: 'refactor: standardize Jenkinsfile syntax and fix stage definitions',
      author: 'mahankalibhanubabu',
      status: 'SUCCESS',
      startedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      duration: '2m 10s',
      stages: [
        { name: 'Clone Repo', status: 'SUCCESS', duration: '9s' },
        { name: 'Build Docker Image', status: 'SUCCESS', duration: '1m 15s' },
        { name: 'Stop & Remove Previous Container', status: 'SUCCESS', duration: '6s' },
        { name: 'Run Docker Container', status: 'SUCCESS', duration: '14s' },
        { name: 'Send Email Notification', status: 'SUCCESS', duration: '3s' },
      ],
      logs: [
        '[Jenkins] Pipeline #104 triggered by webhook',
        '[Clone Repo] Fetched commit ad97690',
        '[Build Docker Image] Layer cache utilized',
        '[Run Docker] Container running on port 3000',
        '[Notification] Email sent successfully',
      ],
    },
    {
      id: 'pipe-103',
      buildNumber: 103,
      branch: 'feature/pipeline-opt',
      commitHash: '8edda70',
      commitMessage: 'test webhook trigger on push event',
      author: 'mahankalibhanubabu',
      status: 'SUCCESS',
      startedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      duration: '1m 58s',
      stages: [
        { name: 'Clone Repo', status: 'SUCCESS', duration: '11s' },
        { name: 'Build Docker Image', status: 'SUCCESS', duration: '55s' },
        { name: 'Stop & Remove Previous Container', status: 'SUCCESS', duration: '4s' },
        { name: 'Run Docker Container', status: 'SUCCESS', duration: '10s' },
        { name: 'Send Email Notification', status: 'SUCCESS', duration: '2s' },
      ],
      logs: [
        '[Jenkins] Webhook received for push to feature/pipeline-opt',
        '[Build] Docker container nestjs-app spawned',
        '[Done] Build passed without errors',
      ],
    },
  ];

  getSystemStatus() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      status: 'ONLINE',
      app: 'NestJS CI/CD Command Center',
      version: '1.0.0',
      nodeVersion: process.version,
      port: process.env.PORT || 3000,
      host: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      containerName: process.env.CONTAINER_NAME || 'nestjs-app',
      dockerImage: process.env.IMAGE_NAME || 'nestjs-image',
      uptimeSeconds: uptimeSec,
      formattedUptime: this.formatDuration(uptimeSec),
      memory: {
        totalMB: Math.round(totalMem / (1024 * 1024)),
        usedMB: Math.round(usedMem / (1024 * 1024)),
        freeMB: Math.round(freeMem / (1024 * 1024)),
        usagePercent: Math.round((usedMem / totalMem) * 100),
      },
      cpuCount: os.cpus().length,
      timestamp: new Date().toISOString(),
    };
  }

  getPipelines(): PipelineRun[] {
    return this.pipelineHistory;
  }

  getPipelineById(id: string): PipelineRun | undefined {
    return this.pipelineHistory.find((p) => p.id === id);
  }

  getMetrics() {
    const total = this.pipelineHistory.length;
    const successful = this.pipelineHistory.filter((p) => p.status === 'SUCCESS').length;
    const failed = this.pipelineHistory.filter((p) => p.status === 'FAILED').length;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 100;

    return {
      totalDeployments: total + 42, // aggregated count
      successRate: `${successRate}%`,
      avgBuildDuration: '1m 52s',
      activeContainers: 1,
      successfulBuilds: successful,
      failedBuilds: failed,
      deploymentFrequency: '6.4 / day',
      mttr: '4m 12s', // Mean Time to Recovery
      recentTraffic: [
        { time: '00:00', requests: 120, latencyMs: 14 },
        { time: '04:00', requests: 80, latencyMs: 12 },
        { time: '08:00', requests: 340, latencyMs: 18 },
        { time: '12:00', requests: 790, latencyMs: 25 },
        { time: '16:00', requests: 620, latencyMs: 20 },
        { time: '20:00', requests: 450, latencyMs: 16 },
      ],
    };
  }

  triggerPipeline(branch = 'main', commitMsg = 'manual: trigger build from dashboard') {
    const newBuildNumber = this.pipelineHistory.length > 0 ? this.pipelineHistory[0].buildNumber + 1 : 101;
    const newId = `pipe-${newBuildNumber}`;
    const newRun: PipelineRun = {
      id: newId,
      buildNumber: newBuildNumber,
      branch: branch,
      commitHash: Math.random().toString(36).substring(2, 9),
      commitMessage: commitMsg,
      author: 'dashboard-admin',
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      duration: 'Running...',
      stages: [
        { name: 'Clone Repo', status: 'RUNNING', duration: 'in progress' },
        { name: 'Build Docker Image', status: 'PENDING', duration: '-' },
        { name: 'Stop & Remove Previous Container', status: 'PENDING', duration: '-' },
        { name: 'Run Docker Container', status: 'PENDING', duration: '-' },
        { name: 'Send Email Notification', status: 'PENDING', duration: '-' },
      ],
      logs: [
        `[Jenkins] Build #${newBuildNumber} queued by Dashboard user.`,
        `[Jenkins] Agent allocated on EC2 worker.`,
        `[Clone Repo] Initiating git clone for branch ${branch}...`,
      ],
    };

    this.pipelineHistory.unshift(newRun);

    // Simulate asynchronous pipeline progression
    setTimeout(() => {
      newRun.stages[0].status = 'SUCCESS';
      newRun.stages[0].duration = '6s';
      newRun.stages[1].status = 'RUNNING';
      newRun.logs.push('[Clone Repo] Clone complete. Starting Docker build...');
      newRun.logs.push('[Build Docker Image] Step 1/7 : FROM node:18-alpine');
    }, 2500);

    setTimeout(() => {
      newRun.stages[1].status = 'SUCCESS';
      newRun.stages[1].duration = '38s';
      newRun.stages[2].status = 'SUCCESS';
      newRun.stages[2].duration = '4s';
      newRun.stages[3].status = 'RUNNING';
      newRun.logs.push('[Build Docker Image] Image built successfully: nestjs-image:latest');
      newRun.logs.push('[Run Docker Container] Spawning new container on port 3000...');
    }, 5500);

    setTimeout(() => {
      newRun.stages[3].status = 'SUCCESS';
      newRun.stages[3].duration = '8s';
      newRun.stages[4].status = 'SUCCESS';
      newRun.stages[4].duration = '2s';
      newRun.status = 'SUCCESS';
      newRun.duration = '58s';
      newRun.logs.push('[Notification] Deployment alert sent to bobbybhanumahankali@gmail.com');
      newRun.logs.push(`[Jenkins] Build #${newBuildNumber} completed successfully with status SUCCESS.`);
    }, 8500);

    return newRun;
  }

  private formatDuration(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  }
}
