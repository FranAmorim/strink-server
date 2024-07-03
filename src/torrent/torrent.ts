import type { FastifyInstance, RegisterOptions } from 'fastify';
import WebTorrent from 'webtorrent';
import ffmpeg from 'fluent-ffmpeg';
// const torrentId = 'magnet:?xt=urn:btih:25630d72772ee11d4fd990079e55d01b139f4a0e&dn=%5BErai-raws%5D%20Tondemo%20Skill%20de%20Isekai%20Hourou%20Meshi%20-%2003%20%5B720p%5D%5BMultiple%20Subtitle%5D%20%5BENG%5D%5BPOR-BR%5D%5BSPA-LA%5D%5BSPA%5D%5BARA%5D%5BFRE%5D%5BGER%5D%5BITA%5D%5BRUS%5D&tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce';
import Parser from 'rss-parser';
import { parseJudas } from '../utils/judas-subs.js';
// @ts-ignore
import { SubtitleParser } from 'matroska-subtitles';
import { parseEraiRaws } from '../utils/erai-subs.js';

let parser = new Parser({
  customFields: {
    item: ['nyaa:seeders']
  }
});
// const torrentId = "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent"

// const torrentId = "https://nyaa.si/download/1796483.torrent"

// const torrentId = "magnet:?xt=urn:btih:650a227dca4348f5b8158c31103a6a2b09473791&dn=%5BLostYears%5D%20Solo%20Leveling%20-%20S01E12%20%28WEB%201080p%20x264%20AAC%29%20%5BDual-Audio%5D%20%7C%20Ore%20dake%20Level%20Up%20na%20Ken%20%7C%20I%20Level%20Up%20Alone%20%7C%20Na%20Honjaman%20Level%20Up&tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce"
// const torrentId = "magnet:?xt=urn:btih:3dd19a87e120ce23be4f7fd2a5d15bb920c62070&dn=%5BKoi-Raws%5D%20Solo%20Leveling%20-%2001%20%E3%80%8CI%27m%20Used%20to%20It%E3%80%8D%20%28ANIMAX%201920x1080%20x264%20AAC%29.mkv&tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce"

export async function torrentRoutes(server: FastifyInstance) {
  server.get('/',
    async (req, res) => {
      return 'cenas';
  });

  server.get('/stream',
    (req, res) => {

      const client = new WebTorrent({ utp: true });

      client.add(torrentId, function (torrent) {
        console.log(torrent.files.length)
        const file = torrent.files.find(function (file) {
          console.log(file.name)
          const arr = file.name.split('.');
          console.log(['mp4', 'mkv'].includes(arr[arr.length - 1]));
          return ['mp4', 'mkv'].includes(arr[arr.length - 1]);
        })
    
        if (file) {

          const fileSize = file.length;
          const videoRange = req.headers.range;

          if (videoRange) {
            const parts = videoRange.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1]
                ? parseInt(parts[1], 10)
                : fileSize-1;
            const chunksize = (end-start) + 1;

            const stream = file.createReadStream({start, end});


           
              
              
            stream.on('error', (err: any) => {
              console.log(err.toString())
            })
      
            stream.on('close', () => {
              console.log('close')
            })
      
            stream.on('end', () => {
              console.log('END')
            })

               // @ts-ignore
            const cmd = ffmpeg(stream)
              .format('mp4')
              .outputOptions(['-movflags frag_keyframe + empty_moov'])
              

            return res
              .header('Content-Range', `bytes ${start}-${end}/${fileSize}`)
              .header('Accept-Ranges', 'bytes')
              .header('Content-Length', `${chunksize}`)
              .header('Content-Type', 'video/mp4')
              .send(cmd.pipe());
            
            
          } else {
            const stream = file.createReadStream();

            return res
              .header('Content-Type', 'video/mp4')
              .send(stream);
          }
        }
      });
  });

  server.get('/source',
    async (req, res) => {
      const { anime, epi }: any = req.query;

      const fansubs = ['Erai-raws', 'Judas']

      
      const cenas = await fetch('https://www.tokyotosho.info/rss.php?filter=1&terms=%5BErai-Raws%5D%20Boku%20no%20Hero%20Academia&searchComment=0&entries=750&reversepolarity=1');

      const resp = await cenas.text();

      console.log(resp)

      return resp;

      const data = await parser.parseString(resp)

      console.log(data.items.length);
      return data;
      // const data = await parser.parseURL(`https://nyaa.si/?page=rss&q=%5B${fansubs[0]}%5D+${anime}&c=0_0&f=0`);
      // console.log(data.items.length);
      // return data;
      // const data = await parser.parseURL(`https://www.tokyotosho.info/rss.php?terms=%5BErai-Raws%5D+Boku+no+Hero+Academia&type=1&searchName=true&searchComment=true&size_min=&size_max=&username=`);
      if (data.items.length > 0) {
        // return parseJudas(data, epi);
        return parseEraiRaws(data, epi);
      } else {
        res.send({
          type: 'none'
        })
      }
    });

  server.get('/subtitles',
    (req, res) => {
      let client = new WebTorrent({ utp: true });

      const tracks = new Map()

      client.add(torrentId, function (torrent) {
        const file = torrent.files.find(function (file) {
          const arr = file.name.split('.');
          console.log(['mp4', 'mkv'].includes(arr[arr.length - 1]));
          return ['mp4', 'mkv'].includes(arr[arr.length - 1]);
        })

        if (file) {
          
          const parser = new SubtitleParser()
          
          
          const stream = file.createReadStream();
          // first an array of subtitle track information is emitted
          parser.once('tracks', (subtitleTracks: any) => {
            subtitleTracks.forEach((track: any) => {
              tracks.set(track.number, {
                language: track.language,
                subtitles: []
              })
            })
      
            parser.on('subtitle', (subtitle: any, trackNumber: any) =>
              tracks.get(trackNumber).subtitles.push(subtitle))
          })
      
          parser.on('finish', () => {
            // tracks.forEach((track) => console.log(track));
            // console.log(tracks.get(4));
            console.log('done');
            client.destroy();
            res.send({
              status: 'done',
              data: Array.from(tracks),
            }) 
          })
          
          stream.pipe(parser)
        }
      });
    }
  )
}

export const torrentRoutesOptions: RegisterOptions = {
  prefix: '/torrent',
};
