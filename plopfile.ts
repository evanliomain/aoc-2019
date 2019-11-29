module.exports = function(plop) {
  // controller generator
  plop.setGenerator('init', {
    description: 'init the advent of code day',
    prompts: [
      {
        type: 'input',
        name: 'day',
        message: 'the day to generate'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'days/{{paddStart day}}/level1.js',
        templateFile: 'plop-templates/simple-function.hbs'
      },
      {
        type: 'add',
        path: 'days/{{paddStart day}}/level2.js',
        templateFile: 'plop-templates/simple-function.hbs'
      },
      {
        type: 'add',
        path: 'days/{{paddStart day}}/in.js',
        templateFile: 'plop-templates/simple-function.hbs'
      },
      {
        type: 'add',
        path: 'days/{{paddStart day}}/level1.test.js',
        templateFile: 'plop-templates/level1.test.hbs'
      },
      {
        type: 'add',
        path: 'days/{{paddStart day}}/level2.test.js',
        templateFile: 'plop-templates/level2.test.hbs'
      },
      {
        type: 'add',
        path: 'days/{{paddStart day}}/sample/1',
        template: 'INPUT TODO'
      }
    ]
  });

  plop.setHelper('paddStart', x => x.padStart(2, '0'));
};
