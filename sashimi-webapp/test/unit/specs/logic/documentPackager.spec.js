import documentPackager from 'src/logic/documentPackager';
import asciiMathBlockOutput from './reference/asciiMathBlockOutput.txt';
import asciiMathBlockInput from './reference/asciiMathBlockInput.txt';
import asciiMathInlineOutput from './reference/asciiMathInlineOutput.txt';
import conditionalInput from './reference/conditionalInput.txt';
import conditionalOutput from './reference/conditionalOutput.txt';
import diagramsInput from './reference/diagrams/diagramsInput.txt';
import diagramsBase64Output from './reference/diagrams/diagramsBase64Output.txt';
import highlightjsInput from './reference/highlightjsInput.txt';
import highlightjsOutput from './reference/highlightjsOutput.txt';
import katexInput from './reference/katexInput.txt';
import katexOutput from './reference/katexBase64Output.txt';
import tocInput from './reference/tocInput.txt';
import tocOutput from './reference/tocOutput.txt';
import xssInput from './reference/xssFilterInput.txt';
import xssOutput from './reference/xssFilterOutput.txt';

function base64(data) {
  return btoa(
    encodeURIComponent(data).replace(/[!'()*]/g,
    character =>
      `%${character.charCodeAt(0).toString(16)}`)
  );
}

function newlineFilter(data) {
  return data.replace(/[\r]/g, '');
}

describe('Document Packager', () => {
  describe('getHtmlData', () => {
    it('should handle empty data', (done) => {
      documentPackager.getHtmlData('')
      .then((output) => {
        expect(output).to.equal('');
        done();
      })
      .catch((error) => {
        done(error);
      });
    });

    it('should handle plaintext data', (done) => {
      documentPackager.getHtmlData('test')
      .then((output) => {
        expect(output).to.equal('<p class="code-line" data-line-start="1" data-line-end="1">test</p>\n');
        done();
      })
      .catch((error) => {
        done(error);
      });
    });

    it('should handle markdown data', (done) => {
      documentPackager.getHtmlData('# Hello World!')
      .then((output) => {
        expect(output).to.equal(
          '<h1 id="hello-world" class="code-line" data-line-start="1" data-line-end="1">Hello World!</h1>\n'
        );
        done();
      })
      .catch((error) => {
        done(error);
      });
    });

    it('should handle conditional hiding data', (done) => {
      documentPackager.getHtmlData(conditionalInput).then((output) => {
        expect(output).to.equal(newlineFilter(conditionalOutput));
        done();
      })
      .catch((error) => {
        done(error);
      });
    });

    it('should handle mathematical formula typed in LaTeX', (done) => {
      documentPackager.getHtmlData(katexInput).then((output) => {
        const base64Output = base64(output);
        expect(base64Output).to.equal(katexOutput);
        done();
      })
      .catch((error) => {
        done(error);
      });
    });

    it('should handle inline ASCIIMath syntax', (done) => {
      documentPackager.getHtmlData('`math sum_(i=1)^n i^3=((n(n+1))/2)^2`').then((output) => {
        const base64Output = base64(output);
        expect(base64Output).to.equal(asciiMathInlineOutput);
        done();
      })
      .catch((error) => {
        done(error);
      });
    });

    it('should handle block ASCIIMath syntax', (done) => {
      documentPackager.getHtmlData(asciiMathBlockInput).then((output) => {
        const base64Output = base64(output);
        expect(base64Output).to.equal(asciiMathBlockOutput);
        done();
      })
      .catch((error) => {
        done(error);
      });
    });

    it('should handle code syntax highlighting', (done) => {
      documentPackager.getHtmlData(highlightjsInput).then((output) => {
        const base64Output = base64(output);
        expect(base64Output).to.equal(highlightjsOutput);
        done();
      })
      .catch((error) => {
        done(error);
      });
    });

    it('should handle HTML XSS threats', (done) => {
      documentPackager.getHtmlData(xssInput).then((output) => {
        expect(output).to.equal(newlineFilter(xssOutput));
        done();
      })
      .catch((error) => {
        done(error);
      });
    });

    it('should handle generation of TOC', (done) => {
      documentPackager.getHtmlData(tocInput).then((output) => {
        expect(output).to.equal(newlineFilter(tocOutput));
        done();
      })
      .catch((error) => {
        done(error);
      });
    });

    it('should handle generation of diagram pre tags for drawing diagrams', (done) => {
      documentPackager.getHtmlData(diagramsInput).then((output) => {
        const base64Output = base64(output);
        expect(base64Output).to.equal(diagramsBase64Output);
        done();
      })
      .catch((error) => {
        done(error);
      });
    });
  });
});
