describe("Core htmx Events", function() {
    beforeEach(function () {
        this.server = makeServer();
        clearWorkArea();
    });
    afterEach(function () {
        this.server.restore();
        clearWorkArea();
    });

    it("load.htmx fires properly", function () {
        var called = false;
        var handler = htmx.on("htmx:load", function (evt) {
            called = true;
        });
        try {
            this.server.respondWith("GET", "/test", "");
            this.server.respondWith("GET", "/test", "<div></div>");
            var div = make("<div hx-get='/test'></div>");
            div.click();
            this.server.respond();
            should.equal(called, true);
        } finally {
            htmx.off("htmx:load", handler);
        }
    });

    it("configRequest.htmx allows attribute addition", function () {
        var handler = htmx.on("htmx:configRequest", function (evt) {
            evt.detail.parameters['param'] = "true";
        });
        try {
            var param = null;
            this.server.respondWith("POST", "/test", function (xhr) {
                param = getParameters(xhr)['param'];
                xhr.respond(200, {}, "");
            });
            var div = make("<div hx-post='/test'></div>");
            div.click();
            this.server.respond();
            param.should.equal("true");
        } finally {
            htmx.off("htmx:configRequest", handler);
        }
    });

    it("configRequest.htmx allows attribute removal", function () {
        var param = "foo";
        var handler = htmx.on("htmx:configRequest", function (evt) {
            delete evt.detail.parameters['param'];
        });
        try {
            this.server.respondWith("POST", "/test", function (xhr) {
                param = getParameters(xhr)['param'];
                xhr.respond(200, {}, "");
            });
            var div = make("<form hx-trigger='click' hx-post='/test'><input name='param' value='foo'></form>");
            div.click();
            this.server.respond();
            should.equal(param, undefined);
        } finally {
            htmx.off("htmx:configRequest", handler);
        }
    });

    it("configRequest.htmx allows header tweaking", function () {
        var header = "foo";
        var handler = htmx.on("htmx:configRequest", function (evt) {
            evt.detail.headers['X-My-Header'] = "bar";
        });
        try {
            this.server.respondWith("POST", "/test", function (xhr) {
                header = xhr.requestHeaders['X-My-Header'];
                xhr.respond(200, {}, "");
            });
            var div = make("<form hx-trigger='click' hx-post='/test'><input name='param' value='foo'></form>");
            div.click();
            this.server.respond();
            should.equal(header, "bar");
        } finally {
            htmx.off("htmx:configRequest", handler);
        }
    });

    it("afterSwap.htmx is called when replacing outerHTML", function () {
        var called = false;
        var handler = htmx.on("htmx:afterSwap", function (evt) {
            called = true;
        });
        try {
            this.server.respondWith("POST", "/test", function (xhr) {
                xhr.respond(200, {}, "<button>Bar</button>");
            });
            var div = make("<button hx-post='/test' hx-swap='outerHTML'>Foo</button>");
            div.click();
            this.server.respond();
            should.equal(called, true);
        } finally {
            htmx.off("htmx:afterSwap", handler);
        }
    });

    it("afterSettle.htmx is called when replacing outerHTML", function () {
        var called = false;
        var handler = htmx.on("htmx:afterSettle", function (evt) {
            called = true;
        });
        try {
            this.server.respondWith("POST", "/test", function (xhr) {
                xhr.respond(200, {}, "<button>Bar</button>");
            });
            var div = make("<button hx-post='/test' hx-swap='outerHTML'>Foo</button>");
            div.click();
            this.server.respond();
            should.equal(called, true);
        } finally {
            htmx.off("htmx:afterSettle", handler);
        }
    });

});

