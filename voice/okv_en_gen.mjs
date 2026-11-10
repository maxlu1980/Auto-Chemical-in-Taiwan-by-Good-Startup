// English lines for Okachimachi with Kokoro-82M (Apache-2.0), run locally with Node: the library kokoro-js with its own voices and its
// text-to-phoneme step (espeak-ng through the package "phonemizer"); the stations' names are given their sounds by hand (IPA between braces
// in the job's text, see okv_en_jobs.py); the symbol table is the model's own (kokoro_vocab.json, from the model's config).
//
//   npm i kokoro-js@1.2.1 kokoro-q8-shards@1.0.0          (the second carries the q8 ONNX weights in six parts; any copy of
//   cat node_modules/kokoro-q8-shards/kokoro-q8.part*.bin > models/onnx-community/Kokoro-82M-v1.0-ONNX/onnx/model_quantized.onnx
//   sha256sum …/model_quantized.onnx                       onnx-community/Kokoro-82M-v1.0-ONNX's model_quantized.onnx will do: its SHA-256 is
//   echo '{"model_type":"style_text_to_speech_2"}' > models/onnx-community/Kokoro-82M-v1.0-ONNX/config.json      fbae9257…9028a1478)
//   node okv_en_gen.mjs <node_modules dir> <models dir> <jobs.json> <out dir>
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
const [KK, MODELS, JOBS, OUT] = process.argv.slice(2).map((p) => path.resolve(p)), HERE = path.dirname(fileURLToPath(import.meta.url));
const TF = await import(pathToFileURL(path.join(KK, '@huggingface/transformers/dist/transformers.node.mjs')).href);
const { KokoroTTS } = await import(pathToFileURL(path.join(KK, 'kokoro-js/dist/kokoro.js')).href);
const { phonemize } = await import(pathToFileURL(path.join(KK, 'phonemizer/dist/phonemizer.js')).href);
TF.env.localModelPath = MODELS + '/'; TF.env.allowRemoteModels = false; TF.env.allowLocalModels = true;
const VOCAB = JSON.parse(fs.readFileSync(path.join(HERE, 'kokoro_vocab.json'), 'utf8'));
const tokenizer = (ph) => { const ids = [0]; for (const ch of ph) { const v = VOCAB[ch]; if (v != null) ids.push(v); } if (ids.length > 509) ids.length = 509; ids.push(0); return { input_ids: new TF.Tensor('int64', BigInt64Array.from(ids.map(BigInt)), [1, ids.length]) }; };
const PUNCT = /(\s*[;:,.!?—…"“”()]+\s*)+/g;
async function plain(t) { const out = []; let k = 0; for (const m of t.matchAll(PUNCT)) { if (k < m.index) out.push((await phonemize(t.slice(k, m.index), 'en-us')).join(' ')); out.push(m[0]); k = m.index + m[0].length; } if (k < t.length) out.push((await phonemize(t.slice(k), 'en-us')).join(' ')); return out.join(''); }
async function phon(text) { const parts = text.split(/\{([^}]*)\}/), out = []; for (let i = 0; i < parts.length; i++) { if (i % 2) out.push(parts[i]); else if (parts[i].trim()) { const lead = /^\s/.test(parts[i]) ? ' ' : '', tail = /\s$/.test(parts[i]) ? ' ' : ''; out.push(lead + (await plain(parts[i].trim())) + tail); } else if (parts[i]) out.push(' '); }
  return out.join('').replace(/ʲ/g, 'j').replace(/r/g, 'ɹ').replace(/x/g, 'k').replace(/ɬ/g, 'l').replace(/ z(?=[;:,.!?—…"“” ]|$)/g, 'z').replace(/  +/g, ' ').trim(); }
const model = await TF.StyleTextToSpeech2Model.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
const tts = new KokoroTTS(model, tokenizer), jobs = JSON.parse(fs.readFileSync(JOBS, 'utf8')); fs.mkdirSync(OUT, { recursive: true });
for (const j of jobs) { const ph = await phon(j.text), { input_ids } = tokenizer(ph), audio = await tts.generate_from_ids(input_ids, { voice: j.voice, speed: j.speed || 1 });
  await audio.save(path.join(OUT, j.id + '.wav')); console.log(j.id, j.voice, (audio.audio.length / audio.sampling_rate).toFixed(2) + ' s', '|', ph); }
