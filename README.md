diaspora* Advanced Sharer
=========================

diaspora* Advanced Sharer is a tool able to share links to any [diaspora*](http://github.com/diaspora/diaspora) pod. [Learn more](http://sharetodiaspora.github.io/about).

### Usage
d*AS uses the same parameters than diaspora* bookmarklets for title, url and notes. Just append them to the URL:

```
http://sharetodiaspora.github.io/?url=joindiaspora.com&title=Join%20diaspora&notes=official%20diaspora*%20pod
```

You can use [share buttons and a custom bookmarklet](http://sharetodiaspora.github.io/about) to create these links.

**Note**: If you've marked *Remember my choice* then you will be always redirected to the pods you chose that time. To avoid this, add the parameter `&redirect=false` on the URL.

### Contributing a translation
So you want to contribute? Thank you!

We're currently using [L20n](https://github.com/l20n/l20n.js) by Mozilla for localization. To contribute a translation, [fork this project](https://github.com/sharetodiaspora/sharetodiaspora.github.com/fork) and add a locale folder for your language under `locales`. Copy the files `about.l20n` and `index.l20n` from another locale and use them to translate to your language. Then create a pull request to send them to the original repo.