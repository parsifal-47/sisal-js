si = {
    run:function (text) {
        var ast=lex.parse(text);
        var ir= new node.sisalir(ast);
        return ir.execute().toString();
    }
}