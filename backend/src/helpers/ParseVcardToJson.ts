interface JCard {
  [key: string]: any;
}

interface Meta {
  [key: string]: string;
}

const ParseVcardToJson = (input: string): JCard => {
  const Re1 = /^(version|fn|title|org):(.+)$/i;
  const Re2 = /^([^:;]+);([^:]+):(.+)$/;
  const ReKey = /item\d{1,2}\./;
  const fields = {} as JCard;

  input.split(/\r\n|\r|\n/).forEach(line => {
    let results;
    let key;

    if (Re1.test(line)) {
      results = line.match(Re1);
      if (results) {
        key = results[1].toLowerCase();
        const [, , res] = results;
        fields[key] = res;
      }
    } else if (Re2.test(line)) {
      results = line.match(Re2);
      if (results) {
        key = results[1].replace(ReKey, "").toLowerCase();

        const meta = {} as Meta;
        results[2]
          .split(";")
          .map((p, i) => {
            const match = p.match(/([a-z]+)=(.*)/i);
            if (match) {
              return [match[1], match[2]];
            }
            return [`TYPE${i === 0 ? "" : i}`, p];
          })
          .forEach(p => {
            const [, m] = p;
            meta[p[0]] = m;
          });

        if (!fields[key]) fields[key] = [];

        fields[key].push({
          meta,
          value: results[3].split(";")
        });
      }
    }
  });

  return fields;
};

export default ParseVcardToJson;
