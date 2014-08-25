si = {
    run:function (text) {
        var ast=lex.parse(text);
        var ir= new sisalir(ast);
        return ir.execute();
    }
}