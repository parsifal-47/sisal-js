si = {
    run:function (text) {
        var ast=lex.parse(text);
        var ir= new node.sisalir(ast);
        ir.execute();
        return ir.toText();
    }
}