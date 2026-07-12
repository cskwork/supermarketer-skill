import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { commandExists, dimensionsString, sha256File } from '../utils.mjs';

export function inspectVideo(filePath) {
  if (!commandExists('ffprobe')) {
    throw new Error('ffprobe is required to verify rendered video metadata. Install FFmpeg or use a declared PRODUCTION_PACK_ONLY fallback.');
  }
  const args = [
    '-v', 'error',
    '-show_entries', 'format=duration,format_name,size:stream=index,codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels',
    '-of', 'json',
    filePath,
  ];
  const result = spawnSync('ffprobe', args, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(`ffprobe failed: ${(result.stderr || result.stdout).trim()}`);
  }
  const data = JSON.parse(result.stdout);
  const streams = Array.isArray(data.streams) ? data.streams : [];
  const video = streams.find((stream) => stream.codec_type === 'video');
  if (!video) throw new Error(`No video stream found in ${filePath}`);
  const audioStreams = streams.filter((stream) => stream.codec_type === 'audio');
  const duration = Number(data.format?.duration);
  const stat = fs.statSync(filePath);
  return {
    path: filePath,
    format: data.format?.format_name ?? path.extname(filePath).slice(1),
    video_codec: video.codec_name ?? null,
    audio_codecs: audioStreams.map((stream) => stream.codec_name).filter(Boolean),
    width: Number(video.width),
    height: Number(video.height),
    dimensions: video.width && video.height ? dimensionsString(video.width, video.height) : null,
    aspect_ratio: video.width && video.height ? Number(video.width) / Number(video.height) : null,
    duration_seconds: Number.isFinite(duration) ? duration : null,
    frame_rate: video.r_frame_rate ?? null,
    audio_streams: audioStreams.length,
    size_bytes: Number(data.format?.size) || stat.size,
    sha256: sha256File(filePath),
  };
}
