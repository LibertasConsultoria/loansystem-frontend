import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = "https://loansystem-backend.onrender.com";

function ContractList() {
  const [contratos, setContratos] = useState([]);
  const [, setLoading] = useState(true);  
  const [editingContract, setEditingContract] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    carregarContratos();
  }, []);

  const carregarContratos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/contratos/`);
      setContratos(res.data);
    } catch (err) {
      alert("Erro ao carregar contratos.");
    }
    setLoading(false);
  };

  const iniciarEdicao = (contrato) => {
    setEditingContract(contrato);
    setEditForm({ ...contrato });
  };

  const salvarEdicao = async () => {
    try {
      await axios.put(`${API_URL}/contratos/${editingContract.id}`, editForm);
      alert("✅ Contrato atualizado com sucesso!");
      setEditingContract(null);
      carregarContratos();
    } catch (err) {
      alert("Erro ao atualizar contrato.");
    }
  };

  const imprimirDemonstrativo = async (id) => {
    try {
      const contratoRes = await axios.get(`${API_URL}/contratos/${id}`);
      const parcelasRes = await axios.get(`${API_URL}/contratos/${id}/parcelas`);

      const contrato = contratoRes.data;
      const parcelas = parcelasRes.data;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head><title>Demonstrativo - ${contrato.numero_contrato}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #333; padding: 8px; }
            th { background-color: #f0f0f0; }
          </style>
          </head>
          <body>
            <div class="header">
              <h2>MINASA Indústria e Comércio Ltda</h2>
              <h3>Demonstrativo de Empréstimo / Financiamento</h3>
              <p><strong>Contrato:</strong> ${contrato.numero_contrato}</p>
            </div>

            <h5>Dados Gerais do Contrato</h5>
            <table border="1">
              <tr><td><strong>Valor Contrato:</strong></td><td>R$ ${Number(contrato.valor_contrato).toLocaleString('pt-BR')}</td></tr>
              <tr><td><strong>Data Emissão:</strong></td><td>${new Date(contrato.data_emissao).toLocaleDateString('pt-BR')}</td></tr>
              <tr><td><strong>Prazo Total:</strong></td><td>${contrato.prazo_total} meses</td></tr>
              <tr><td><strong>Carência:</strong></td><td>${contrato.carencia} meses</td></tr>
              <tr><td><strong>Sistema:</strong></td><td>${contrato.sistema_amortizacao}</td></tr>
            </table>

            <h5>Fluxo de Pagamento</h5>
            <table border="1">
              <thead>
                <tr>
                  <th>Parcela</th><th>Vencimento</th><th>PMT</th><th>Amortização</th><th>Juros</th><th>Saldo Devedor</th>
                </tr>
              </thead>
              <tbody>
                ${parcelas.map(p => `
                  <tr>
                    <td>${p.numero_parcela}</td>
                    <td>${new Date(p.data_vencimento).toLocaleDateString('pt-BR')}</td>
                    <td>R$ ${Number(p.valor_pmt).toLocaleString('pt-BR')}</td>
                    <td>R$ ${Number(p.valor_amortizacao).toLocaleString('pt-BR')}</td>
                    <td>R$ ${Number(p.valor_juros).toLocaleString('pt-BR')}</td>
                    <td>R$ ${Number(p.saldo_devedor).toLocaleString('pt-BR')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    } catch (err) {
      alert("Erro ao gerar impressão.");
    }
  };

  const excluir = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este contrato?")) return;
    try {
      await axios.delete(`${API_URL}/contratos/${id}`);
      alert("Contrato excluído com sucesso!");
      carregarContratos();
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Listagem de Contratos</h2>
      <button onClick={carregarContratos} className="btn btn-primary mb-3">🔄 Atualizar Lista</button>

      <table className="table table-hover">
        <thead className="table-dark">
          <tr>
            <th>Contrato</th>
            <th>Valor</th>
            <th>Emissão</th>
            <th>Prazo</th>
            <th>Sistema</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {contratos.map(c => (
            <tr key={c.id}>
              <td>{c.numero_contrato}</td>
              <td>R$ {Number(c.valor_contrato).toLocaleString('pt-BR')}</td>
              <td>{new Date(c.data_emissao).toLocaleDateString('pt-BR')}</td>
              <td>{c.prazo_total} meses</td>
              <td>{c.sistema_amortizacao}</td>
              <td>
                <button onClick={() => imprimirDemonstrativo(c.id)} className="btn btn-sm btn-primary me-2">🖨️ Imprimir</button>
                <button onClick={() => iniciarEdicao(c)} className="btn btn-sm btn-warning me-2">✏️ Editar</button>
                <button onClick={() => excluir(c.id)} className="btn btn-sm btn-danger">🗑️ Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===================== MODAL DE EDIÇÃO COMPLETO ===================== */}
      {editingContract && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Contrato - {editingContract.numero_contrato}</h5>
                <button type="button" className="btn-close" onClick={() => setEditingContract(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Nº Contrato</label>
                    <input type="text" className="form-control" value={editForm.numero_contrato || ''} onChange={(e) => setEditForm({...editForm, numero_contrato: e.target.value})} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Valor Contrato (R$)</label>
                    <input type="number" className="form-control" value={editForm.valor_contrato || ''} onChange={(e) => setEditForm({...editForm, valor_contrato: parseFloat(e.target.value)})} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Data de Emissão</label>
                    <input type="date" className="form-control" value={editForm.data_emissao ? editForm.data_emissao.split('T')[0] : ''} onChange={(e) => setEditForm({...editForm, data_emissao: e.target.value})} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>1º Vencimento</label>
                    <input type="date" className="form-control" value={editForm.data_primeiro_vencimento ? editForm.data_primeiro_vencimento.split('T')[0] : ''} onChange={(e) => setEditForm({...editForm, data_primeiro_vencimento: e.target.value})} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label>Prazo Total (meses)</label>
                    <input type="number" className="form-control" value={editForm.prazo_total || ''} onChange={(e) => setEditForm({...editForm, prazo_total: parseInt(e.target.value)})} />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Carência (meses)</label>
                    <input type="number" className="form-control" value={editForm.carencia || ''} onChange={(e) => setEditForm({...editForm, carencia: parseInt(e.target.value)})} />
                  </div>
                  <div className="col-md-4 mb-3 pt-4">
                    <div className="form-check">
                      <input type="checkbox" checked={editForm.paga_juros_carencia || false} onChange={(e) => setEditForm({...editForm, paga_juros_carencia: e.target.checked})} className="form-check-input" />
                      <label className="form-check-label">Paga juros na carência</label>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Taxa Mensal (%)</label>
                    <input type="number" step="0.000001" className="form-control" value={editForm.taxa_juros_mensal || ''} onChange={(e) => setEditForm({...editForm, taxa_juros_mensal: parseFloat(e.target.value)})} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Taxa Anual (%)</label>
                    <input type="number" step="0.000001" className="form-control" value={editForm.taxa_juros_anual || ''} onChange={(e) => setEditForm({...editForm, taxa_juros_anual: parseFloat(e.target.value)})} />
                  </div>
                </div>

                <div className="mb-3">
                  <label>Sistema de Amortização</label>
                  <select className="form-select" value={editForm.sistema_amortizacao || 'SAC'} onChange={(e) => setEditForm({...editForm, sistema_amortizacao: e.target.value})}>
                    <option value="SAC">SAC</option>
                    <option value="PRICE">PRICE</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label>Garantias</label>
                  <textarea className="form-control" rows="2" value={editForm.garantias || ''} onChange={(e) => setEditForm({...editForm, garantias: e.target.value})} />
                </div>

                <h6>Despesas</h6>
                <div className="row">
                  <div className="col-md-4 mb-2">
                    <input type="number" className="form-control" placeholder="IOF" value={editForm.valor_iof || 0} onChange={(e) => setEditForm({...editForm, valor_iof: parseFloat(e.target.value)})} />
                  </div>
                  <div className="col-md-4 mb-2">
                    <input type="number" className="form-control" placeholder="Tarifas" value={editForm.valor_tarifas || 0} onChange={(e) => setEditForm({...editForm, valor_tarifas: parseFloat(e.target.value)})} />
                  </div>
                  <div className="col-md-4 mb-2">
                    <input type="number" className="form-control" placeholder="Seguro" value={editForm.valor_seguro || 0} onChange={(e) => setEditForm({...editForm, valor_seguro: parseFloat(e.target.value)})} />
                  </div>
                  <div className="col-md-4 mb-2">
                    <input type="number" className="form-control" placeholder="Comissão" value={editForm.valor_comissao || 0} onChange={(e) => setEditForm({...editForm, valor_comissao: parseFloat(e.target.value)})} />
                  </div>
                  <div className="col-md-4 mb-2">
                    <input type="number" className="form-control" placeholder="Outras" value={editForm.outras_despesas || 0} onChange={(e) => setEditForm({...editForm, outras_despesas: parseFloat(e.target.value)})} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditingContract(null)}>Cancelar</button>
                <button className="btn btn-success" onClick={salvarEdicao}>Salvar Alterações</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractList;