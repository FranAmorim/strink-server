export function isBatch(title: string) {
  return title.includes('BATCH');
}

export function parseEraiRaws(data: any, searchTitle: string) {
  const items = [];

  const noHEVC = data.items.filter((item: any) => !item.title.includes('HEVC') )
  for (const item of noHEVC) {
    let information = {};
    if (isBatch(item.title)) {
      const [fansub, quality, type, subs] = item.title.match(/\[(.*?)\]/g);
      const title = item.title.replace(/\[(.*?)\]/g, '').split(' - ')[0];

      information = {
        // sourceName: item.title,
        title: title.replace(/[\(\)]/g, '').trim(),
        type: type.replace(/[\(\)]/g, ''),
        fansub: fansub.replace(/[\[\]]/g, ''),
        quality : quality.replace(/[\[\]]/g, ''),
        subs: subs.replace(/[\[\]]/g, ''),
      }

    } else {
      const [fansub, quality, subs] = item.title.match(/\[(.*?)\]/g);
      const [title, episode] = item.title.replace(/\[(.*?)\]/g, '').split(' - ');

      information = {
        // sourceName: item.title,
        title: title.replace(/[\(\)]/g, '').trim(),
        fansub: fansub.replace(/[\[\]]/g, ''),
        quality : quality.replace(/[\[\]]/g, ''),
        subs: subs.replace(/[\[\]]/g, ''),
        episode: Number(episode),
      }
    }

    items.push({
      ...information,
      // season: !isBatch(item.title) ? info[1].split(' ')[0].replace('E', ' E').split(' ')[0] : 0,
      // episode: !isBatch(item.title) ? info[1].split(' ')[0].replace('E', ' E').split(' ')[1] : 0,
      type: isBatch(item.title) ? 'batch' : 'single',
      data: item.link,
      seeders: item['nyaa:seeders'],
    })
  }

  console.log(items.length)
  return items;
  const exactTitle = items.filter((item: any) => item.title === searchTitle)
// return items;
  const byQuality: any = {};

  for (const item of exactTitle ) {
    // @ts-ignore
    const key = item.type === 'batch' ? 'batch' : item.episode;

    if (key in byQuality) {
      byQuality[key] = {
        ...byQuality[key],
        data: {
          ...byQuality[key].data,
          // @ts-ignore
          [item.quality]: {
            link: item.data,
            seeds: item.seeders,
          }
        }
      }


    } else {
      byQuality[key] = {
        ...item,
        data: {
          // @ts-ignore
          [item.quality]: {
            link: item.data,
            seeds: item.seeders,
          }
        }
      }

      delete byQuality[key]['seeders']
      delete byQuality[key]['quality']
    }
   
  }


  console.log('2',  Object.values(byQuality).length)

  return Object.values(byQuality);
} 