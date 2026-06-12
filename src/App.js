import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import ContractList from './pages/ContractList';

function App() {
  const [form, setForm] = useState({
    numero_contrato: "",
    valor_contrato: 383980,
    data_emissao: "2025-06-01",
    data_primeiro_vencimento: "",
    prazo_total: 36,
    carencia: 6,
    paga_juros_carencia: true,
    taxa_juros_mensal: 0.021783,
    taxa_juros_anual: 0,
    sistema_amortizacao: "SAC",
    garantias: "",
    valor_iof: 0,
    valor_tarifas: 0,
    valor_seguro: 0,
    valor_comissao: 0,
    outras_despesas: 0,
    observacoes: ""
  });

  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked :
              ['valor_contrato', 'taxa_juros_mensal', 'taxa_juros_anual', 
               'valor_iof', 'valor_tarifas', 'valor_seguro', 'valor_comissao', 'outras_despesas'].includes(name) 
              ? parseFloat(value) || 0 
              : ['prazo_total', 'carencia'].includes(name) 
              ? parseInt(value) || 0 
              : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
  const response = await axios.post('https://loansystem-backend.onrender.com/simulate/', form);
      setResultado(response.data);
      alert("✅ Simulação realizada e salva com sucesso!");
    } catch (error) {
      alert("Erro ao simular: " + (error.response?.data?.detail || error.message));
    }
    setLoading(false);
  };

  const imprimirDemonstrativo = () => {
    if (!resultado) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Demonstrativo - ${resultado.contrato.numero_contrato}</title>
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
            <p><strong>Contrato:</strong> ${resultado.contrato.numero_contrato}</p>
          </div>

          <h5>Dados Gerais do Contrato</h5>
          <table>
            <tr><td><strong>Valor Contrato:</strong></td><td>R$ ${resultado.contrato.valor_contrato.toLocaleString('pt-BR')}</td></tr>
            <tr><td><strong>Data Emissão:</strong></td><td>${new Date(resultado.contrato.data_emissao).toLocaleDateString('pt-BR')}</td></tr>
            <tr><td><strong>1º Vencimento:</strong></td><td>${resultado.contrato.data_primeiro_vencimento ? new Date(resultado.contrato.data_primeiro_vencimento).toLocaleDateString('pt-BR') : '-'}</td></tr>
            <tr><td><strong>Prazo Total:</strong></td><td>${resultado.contrato.prazo_total} meses</td></tr>
            <tr><td><strong>Carência:</strong></td><td>${resultado.contrato.carencia} meses (${resultado.contrato.paga_juros_carencia ? 'Com pagamento de juros' : 'Sem pagamento de juros - capitalizado'})</td></tr>
            <tr><td><strong>Taxa Mensal:</strong></td><td>${(resultado.contrato.taxa_juros_mensal * 100).toFixed(4)}%</td></tr>
            <tr><td><strong>Sistema:</strong></td><td>${resultado.contrato.sistema_amortizacao}</td></tr>
            <tr><td><strong>Despesas Totais:</strong></td><td>R$ ${resultado.contrato.valor_total_despesas.toLocaleString('pt-BR')}</td></tr>
          </table>

          <h5>Fluxo de Pagamento</h5>
          <table>
            <thead>
              <tr>
                <th>Parcela</th><th>Vencimento</th><th>PMT</th><th>Amortização</th><th>Juros</th><th>Saldo Devedor</th>
              </tr>
            </thead>
            <tbody>
              ${resultado.parcelas.map(p => `
                <tr>
                  <td>${p.numero_parcela}</td>
                  <td>${new Date(p.data_vencimento).toLocaleDateString('pt-BR')}</td>
                  <td>R$ ${p.valor_pmt.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td>R$ ${p.valor_amortizacao.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td>R$ ${p.valor_juros.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td>R$ ${p.saldo_devedor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <Router>
      <div className="container mt-4">
        <h1 className="text-center mb-4">🚀 Cadastro de Empréstimos Bancários - MINASA IND E COM LTDA</h1>

        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <Link className="nav-link" to="/">Novo Contrato</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/contratos">Listagem de Contratos</Link>
          </li>
        </ul>

        <Routes>
          <Route path="/" element={
            <div className="row">
              <div className="col-lg-5">
                <div className="card shadow">
                  <div className="card-header bg-primary text-white">
                    <h5>Novo Contrato</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label>Nº Contrato</label>
                          <input type="text" name="numero_contrato" value={form.numero_contrato} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Valor Contrato (R$)</label>
                          <input type="number" name="valor_contrato" value={form.valor_contrato} onChange={handleChange} className="form-control" required />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label>Data Emissão</label>
                          <input type="date" name="data_emissao" value={form.data_emissao} onChange={handleChange} className="form-control" required />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>1º Vencimento</label>
                          <input type="date" name="data_primeiro_vencimento" value={form.data_primeiro_vencimento} onChange={handleChange} className="form-control" />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label>Prazo Total (meses)</label>
                          <input type="number" name="prazo_total" value={form.prazo_total} onChange={handleChange} className="form-control" required />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label>Carência (meses)</label>
                          <input type="number" name="carencia" value={form.carencia} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-4 mb-3 pt-4">
                          <div className="form-check">
                            <input type="checkbox" name="paga_juros_carencia" checked={form.paga_juros_carencia} onChange={handleChange} className="form-check-input" />
                            <label className="form-check-label">Paga juros na carência</label>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label>Taxa Mensal (%)</label>
                          <input type="number" step="0.000001" name="taxa_juros_mensal" value={form.taxa_juros_mensal} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Taxa Anual (%)</label>
                          <input type="number" step="0.000001" name="taxa_juros_anual" value={form.taxa_juros_anual} onChange={handleChange} className="form-control" />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label>Sistema de Amortização</label>
                        <select name="sistema_amortizacao" value={form.sistema_amortizacao} onChange={handleChange} className="form-select">
                          <option value="SAC">SAC</option>
                          <option value="PRICE">PRICE</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label>Garantias</label>
                        <textarea name="garantias" value={form.garantias} onChange={handleChange} className="form-control" rows="2" />
                      </div>

                      <h6>Despesas</h6>
                      <div className="row">
                        <div className="col-md-6 mb-2">
                          <input type="number" name="valor_iof" placeholder="IOF" value={form.valor_iof} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-6 mb-2">
                          <input type="number" name="valor_tarifas" placeholder="Tarifas" value={form.valor_tarifas} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-6 mb-2">
                          <input type="number" name="valor_seguro" placeholder="Seguro Prestamista" value={form.valor_seguro} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-6 mb-2">
                          <input type="number" name="valor_comissao" placeholder="Comissão" value={form.valor_comissao} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-12 mb-3">
                          <input type="number" name="outras_despesas" placeholder="Outras Despesas" value={form.outras_despesas} onChange={handleChange} className="form-control" />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-success w-100 mb-2" disabled={loading}>
                        {loading ? "Calculando..." : "Simular e Salvar"}
                      </button>

                      {resultado && (
                        <button type="button" onClick={imprimirDemonstrativo} className="btn btn-outline-primary w-100">
                          🖨️ Imprimir Demonstrativo Completo
                        </button>
                      )}
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                {resultado && (
                  <div className="card shadow">
                    <div className="card-header bg-success text-white">
                      <h5>Fluxo de Pagamento Gerado</h5>
                    </div>
                    <div className="card-body">
                      <h6>Contrato: <strong>{resultado.contrato.numero_contrato}</strong></h6>
                      <div className="table-responsive" style={{maxHeight: "650px", overflowY: "auto"}}>
                        <table className="table table-striped table-hover">
                          <thead className="table-dark sticky-top">
                            <tr>
                              <th>#</th>
                              <th>Vencimento</th>
                              <th>PMT</th>
                              <th>Amortização</th>
                              <th>Juros</th>
                              <th>Saldo Devedor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultado.parcelas.map(p => (
                              <tr key={p.numero_parcela}>
                                <td>{p.numero_parcela}</td>
                                <td>{new Date(p.data_vencimento).toLocaleDateString('pt-BR')}</td>
                                <td>R$ {p.valor_pmt.toLocaleString('pt-BR')}</td>
                                <td>R$ {p.valor_amortizacao.toLocaleString('pt-BR')}</td>
                                <td>R$ {p.valor_juros.toLocaleString('pt-BR')}</td>
                                <td>R$ {p.saldo_devedor.toLocaleString('pt-BR')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          } />

          <Route path="/contratos" element={<ContractList />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;