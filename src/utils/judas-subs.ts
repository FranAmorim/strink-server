export function isBatch(title: string) {
  return title.includes('Batch');
}

export function parseJudas(data: any, episode: string) {
  const torrent = data.items.filter((item: any) => !item?.title?.includes('~'))[0]


  const items = [];

  for (const item of data.items) {

    
    let information = {};
    if (isBatch(item.title)) {
      const [season, type] = item.title.match(/\((.*?)\)/g);
      const [fansub, quality, codec, subs] = item.title.match(/\[(.*?)\]/g);
      const title = item.title.replace(/\[(.*?)\]/g, '').replace(/\((.*?)\)/g,  '');
      information = {
        title: title.replace(/[\(\)]/g, '').trim(),
        type: type.replace(/[\(\)]/g, ''),
        fansub: fansub.replace(/[\[\]]/g, ''),
        quality : quality.replace(/[\[\]]/g, ''),
        codec: codec.replace(/[\[\]]/g, ''),
        subs: subs.replace(/[\[\]]/g, ''),
        season: Number(season.replace('S', '')),
        episode: Number(episode.replace('E', '')),
      }

    } else {
      const [title, type] = item.title.match(/\((.*?)\)/g);
      const [fansub, quality, codec, subs] = item.title.match(/\[(.*?)\]/g);
      const [originalTitle, seasonEpisode] = item.title.replace(/\[(.*?)\]/g, '').replace(/\((.*?)\)/g,  '').split(' - ');

      const [season, episode] =  seasonEpisode.replace('E', ' E').split(' ');

      information = {
        title: title.replace(/[\(\)]/g, '').trim(),
        originalTitle: originalTitle.trim(),
        type: type.replace(/[\(\)]/g, ''),
        fansub: fansub.replace(/[\[\]]/g, ''),
        quality : quality.replace(/[\[\]]/g, ''),
        codec: codec.replace(/[\[\]]/g, ''),
        subs: subs.replace(/[\[\]]/g, ''),
        season: Number(season.replace('S', '')),
        episode: Number(episode.replace('E', '')),
      }
    }
    // const info = isBatch(item.title) ? item.title.split(') ') : item.title.split(' - ');
    // const ola = info[1].split(' [')[0].replace('E', ' E').split(' ');
    // console.log( )

    // const [fansub, quality, codec, subs] = item.title.match(/\((.*?)\)/g);
    console.log()

    // if (isBatch(item.title)) {
    //       const [season, epi] = info[1].split(' ')[0].replace('E', ' E').spli(' ');
    //       console.log(info[1])
    // }
    items.push({
      ...information,
      // season: !isBatch(item.title) ? info[1].split(' ')[0].replace('E', ' E').split(' ')[0] : 0,
      // episode: !isBatch(item.title) ? info[1].split(' ')[0].replace('E', ' E').split(' ')[1] : 0,
      type: isBatch(item.title) ? 'batch' : 'single',
      data: item.link,
      seeders: item['nyaa:seeders'],
    })
  }
  // if (torrent) {
  //   return {
  //     type: 'single',
  //     data:torrent.link,
  //     seeders: torrent['nyaa:seeders'],
  //   }
  // } else {
  //   const batch = data.items.find((item: any) => isBatch(item.title))
  //   return {
  //     type: 'batch',
  //     data: batch.link,
  //     seeders: batch['nyaa:seeders'],
  //   }
  // }

  return items;
} 