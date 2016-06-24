var resource = require('./resource');

module.exports = resource.defineModel('pages', {
  listArticles: [
    'get', '/pages/{page_id}/articles', [ 'page_id' ]
  ],
  getArticle: [
    'get', '/pages/{page_id}/articles/{article_id}', [ 'page_id', 'article_id' ]
  ]
}, {
  relations: {
    articles: true
  }
});
