import * as fs from 'node:fs';
import { join } from 'node:path';
import Sinon, { SinonStub, stub } from 'sinon';
import { Application, DefaultThemeRenderContext, EventHooks, JSX, PageEvent, RendererEvent } from 'typedoc';
import { expect } from 'chai';
import tmp from 'tmp';
import { load } from '../src/index.jsx';
import { getRandomValues } from 'node:crypto';

// tmp.setGracefulCleanup();

describe('plugin', () => {
    it('should work', () => {
        const app: Application = {
            renderer: {
                hooks: new EventHooks(),
                on: stub(),
            },
            outputs: {
                getOutputSpecs: stub().returns([{ name: 'html', path: 'mockPath' }]),
            },
            options: {
                addDeclaration: stub(),
                getValue: stub().returns('../versions.json'),
            },
        } as any;
        const context: DefaultThemeRenderContext = {
            toolbar: stub().returns(
                <div class="container">
                    <div>{null}</div>
                    <div id="tsd-search">
                        <div class="field" />
                        <div class="field" />
                        <ul class="results" />

                        <a href='#' class="title" />
                    </div>
                    <div class="table-cell" id="tsd-widgets" />
                </div>,
            ),
            relativeURL: stub().returnsArg(0),
        } as any;

        load(app);

        Sinon.assert.calledOnceWithMatch(app.renderer.on as SinonStub, 'endRender', Sinon.match.func);
        const endRender = (app.renderer.on as SinonStub).getCall(0).args[1] as (event: RendererEvent) => void;

        const assetsRef: JSX.Element[] = app.renderer.hooks.emit('head.end', context);
        expect(assetsRef[0].children.length).to.equal(2);
        expect((assetsRef[0].children[0] as JSX.Element).tag).to.equal('link');
        expect(((assetsRef[0].children[0] as JSX.Element).props as any).href).to.equal('assets/version-select.css');
        expect((assetsRef[0].children[1] as JSX.Element).tag).to.equal('script');
        expect(((assetsRef[0].children[1] as JSX.Element).props as any).src).to.equal('assets/version-select.js');


        const toolbar = context.toolbar(new PageEvent({} as any));
        const sel = (toolbar?.children[1] as JSX.Element).children[4] as JSX.Element;
        expect(sel.tag).to.equal('select');
        expect((sel.props as any).id).to.equal('version-select');

        const outdir = tmp.dirSync().name;
        fs.mkdirSync(join(outdir, 'assets'));
        endRender({ outputDirectory: outdir } as any);
        Sinon.assert.calledOnceWithExactly(app.options.getValue as SinonStub, 'versionSpecUrl');
        expect(fs.readFileSync(join(outdir, '/assets/version-select.css'), 'utf-8')).to.equal(fs.readFileSync('src/assets/version-select.css', 'utf-8'));
        expect(fs.readFileSync(join(outdir, '/assets/version-select.js'), 'utf-8')).to.include('new URL(\'../versions.json\',');
    });

    it('do nothing if html output is not present', () => {
        const app: Application = {
            renderer: {
                hooks: new EventHooks(),
                on: stub(),
            },
            outputs: {
                getOutputSpecs: stub().returns([{ name: 'json', path: 'mockPath' }]),
            },
            options: {
                addDeclaration: stub(),
                getValue: stub(),
            },
        } as any;

        load(app);

        Sinon.assert.notCalled(app.renderer.on as SinonStub);
    });
});

