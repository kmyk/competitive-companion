import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { Test } from '../../models/Test';
import { htmlToElement } from '../../utils';
import { TaskBuilder } from '../../models/TaskBuilder';

export class URIOnlineJudgeProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://www.urionlinejudge.com.br/judge/*/problems/view/*',
      'https://www.urionlinejudge.com.br/repository/*.html',
    ];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise((resolve, reject) => {
      const elem = htmlToElement(html);

      if (elem.querySelector('#description-html') !== null) {
        const link = (elem.querySelector('ul.information > li:nth-child(2) > a') as any).href;

        this.fetch(link)
          .then(data => resolve(this.parseFullscreen(data)))
          .catch(reject);
      } else {
        resolve(this.parseFullscreen(html));
      }
    });
  }

  private parseFullscreen(html: string): Sendable {
    const elem = htmlToElement(html);
    const task = new TaskBuilder();

    task.setName(elem.querySelector('.header > h1').textContent);
    task.setGroup('URI Online Judge');

    elem.querySelectorAll('table').forEach(table => {
      const columns = table.querySelectorAll('tbody > tr > td');

      const input = columns[0].textContent.split('\n').map(x => x.trim()).join('\n');
      const output = columns[1].textContent.split('\n').map(x => x.trim()).join('\n');

      task.addTest(new Test(input, output));
    });

    task.setTimeLimit(parseInt(elem.querySelector('.header > strong').textContent.split(' ')[1]) * 1000);
    task.setMemoryLimit(1024);

    return task.build();
  }
}