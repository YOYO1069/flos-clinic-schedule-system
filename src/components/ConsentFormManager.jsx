import { useState, useRef, useEffect } from 'react'
import { FileCheck, Plus, Edit, Trash2, Download, Eye, Printer } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import SignatureCanvas from 'react-signature-canvas'

// 同意書範本定義（從 consent_form_tw.js 轉換）
const CONSENT_TEMPLATES = {
  cosmetic_surgery: {
    title: '美容醫學手術同意書',
    category: 'surgery',
    required_fields: [
      '病患姓名', '身分證字號', '出生年月日', '聯絡電話',
      '緊急聯絡人', '緊急聯絡電話', '手術名稱', '手術部位',
      '手術日期', '執行醫師', '麻醉方式'
    ],
    content_sections: [
      {
        section: '一、手術說明',
        items: [
          '手術原因及目的', '手術方式及範圍', '手術步驟',
          '手術時間', '使用材料及器械'
        ]
      },
      {
        section: '二、手術風險及併發症',
        items: [
          '出血、血腫', '感染', '疤痕增生',
          '局部麻木或感覺異常', '不對稱', '效果不如預期',
          '需要再次手術之可能性', '麻醉風險（若使用麻醉）', '其他特定風險'
        ]
      },
      {
        section: '三、替代治療方案',
        items: ['其他可行的治療方式', '不治療的風險及後果']
      },
      {
        section: '四、術後注意事項',
        items: [
          '傷口照護方式', '飲食限制', '活動限制',
          '回診時間', '緊急狀況處理', '預期恢復時間'
        ]
      },
      {
        section: '五、費用說明',
        items: [
          '手術費用', '麻醉費用', '材料費用',
          '其他相關費用', '退費規定'
        ]
      },
      {
        section: '六、病患權利',
        items: [
          '本人已充分了解上述說明內容',
          '本人有機會提出疑問並獲得解答',
          '本人了解手術風險及併發症',
          '本人了解替代治療方案',
          '本人了解術後注意事項',
          '本人了解費用及退費規定',
          '本人同意接受此項手術'
        ]
      },
      {
        section: '七、特殊聲明',
        items: [
          '本人確認未懷孕（女性病患）',
          '本人無藥物過敏史',
          '本人無重大疾病史',
          '本人未服用抗凝血藥物',
          '本人已提供完整病史資料'
        ]
      }
    ]
  },
  laser_treatment: {
    title: '光電治療同意書',
    category: 'laser',
    required_fields: [
      '病患姓名', '身分證字號', '出生年月日', '聯絡電話',
      '治療項目', '治療部位', '治療日期', '執行醫師'
    ],
    content_sections: [
      {
        section: '一、治療說明',
        items: [
          '治療目的', '治療方式', '使用儀器',
          '治療次數', '治療間隔'
        ]
      },
      {
        section: '二、可能風險及副作用',
        items: [
          '紅腫、熱感', '暫時性色素沉澱或脫失',
          '水泡、結痂', '疤痕', '效果因人而異', '需要多次治療'
        ]
      },
      {
        section: '三、術後照護',
        items: [
          '加強保濕', '加強防曬（SPF30以上）',
          '避免刺激性保養品', '避免高溫環境', '回診時間'
        ]
      },
      {
        section: '四、禁忌症確認',
        items: [
          '本人確認未懷孕', '本人無光敏感病史',
          '本人未服用光敏感藥物', '本人治療部位無傷口或感染',
          '本人無蟹足腫體質'
        ]
      }
    ]
  },
  injection_treatment: {
    title: '注射治療同意書',
    category: 'injection',
    required_fields: [
      '病患姓名', '身分證字號', '出生年月日', '聯絡電話',
      '注射項目', '注射部位', '注射劑量', '治療日期', '執行醫師'
    ],
    content_sections: [
      {
        section: '一、治療說明',
        items: [
          '注射目的', '注射材料（品牌、劑量）',
          '注射部位', '預期效果', '維持時間'
        ]
      },
      {
        section: '二、可能風險及副作用',
        items: [
          '注射部位紅腫、瘀青', '局部疼痛或壓痛',
          '感染', '過敏反應', '不對稱', '效果不如預期',
          '血管栓塞（極罕見但嚴重）', '肉芽腫形成（罕見）'
        ]
      },
      {
        section: '三、術後注意事項',
        items: [
          '24小時內避免按摩注射部位', '避免劇烈運動',
          '避免高溫環境（三溫暖、烤箱）', '避免飲酒',
          '如有異常立即回診', '回診時間'
        ]
      },
      {
        section: '四、禁忌症確認',
        items: [
          '本人確認未懷孕或哺乳中', '本人無自體免疫疾病',
          '本人無蟹足腫體質', '本人注射部位無感染或發炎',
          '本人無藥物過敏史', '本人未服用抗凝血藥物'
        ]
      }
    ]
  }
}

function ConsentFormManager({ patientId, patientName }) {
  const [consentForms, setConsentForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedForm, setSelectedForm] = useState(null)
  const [formData, setFormData] = useState({})
  const [checkboxes, setCheckboxes] = useState({})
  
  const patientSigRef = useRef(null)
  const doctorSigRef = useRef(null)

  useEffect(() => {
    if (patientId) {
      loadConsentForms()
    }
  }, [patientId])

  const loadConsentForms = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('consent_forms')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setConsentForms(data || [])
    } catch (error) {
      console.error('載入同意書失敗:', error)
      toast.error('載入同意書失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setSelectedTemplate('')
    setFormData({
      病患姓名: patientName || '',
      治療日期: new Date().toISOString().split('T')[0]
    })
    setCheckboxes({})
    setShowCreateDialog(true)
  }

  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey)
    const template = CONSENT_TEMPLATES[templateKey]
    if (template) {
      const newFormData = { ...formData }
      template.required_fields.forEach(field => {
        if (!newFormData[field]) {
          newFormData[field] = field === '病患姓名' ? (patientName || '') : ''
        }
      })
      setFormData(newFormData)
    }
  }

  const handleSaveConsentForm = async () => {
    try {
      const template = CONSENT_TEMPLATES[selectedTemplate]
      if (!template) {
        toast.error('請選擇同意書範本')
        return
      }

      // 驗證必填欄位
      const missingFields = template.required_fields.filter(field => !formData[field])
      if (missingFields.length > 0) {
        toast.error(`請填寫：${missingFields.join('、')}`)
        return
      }

      // 獲取簽名
      const patientSignature = patientSigRef.current?.toDataURL()
      const doctorSignature = doctorSigRef.current?.toDataURL()

      if (!patientSignature || patientSigRef.current?.isEmpty()) {
        toast.error('請提供病患簽名')
        return
      }

      if (!doctorSignature || doctorSigRef.current?.isEmpty()) {
        toast.error('請提供醫師簽名')
        return
      }

      const { error } = await supabase
        .from('consent_forms')
        .insert([{
          patient_id: patientId,
          template_type: selectedTemplate,
          template_title: template.title,
          form_data: formData,
          checkboxes: checkboxes,
          patient_signature: patientSignature,
          doctor_signature: doctorSignature,
          status: 'signed',
          signed_at: new Date().toISOString()
        }])

      if (error) throw error

      toast.success('同意書儲存成功')
      setShowCreateDialog(false)
      loadConsentForms()
    } catch (error) {
      console.error('儲存同意書失敗:', error)
      toast.error('儲存同意書失敗')
    }
  }

  const handleViewForm = (form) => {
    setSelectedForm(form)
    setShowViewDialog(true)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDeleteForm = async (formId) => {
    if (!confirm('確定要刪除此同意書嗎？')) return

    try {
      const { error } = await supabase
        .from('consent_forms')
        .delete()
        .eq('id', formId)

      if (error) throw error
      toast.success('同意書刪除成功')
      loadConsentForms()
    } catch (error) {
      console.error('刪除同意書失敗:', error)
      toast.error('刪除同意書失敗')
    }
  }

  const template = selectedTemplate ? CONSENT_TEMPLATES[selectedTemplate] : null

  return (
    <div className="space-y-4">
      {/* 標題和新增按鈕 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-100">同意書管理</h3>
        <Button
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增同意書
        </Button>
      </div>

      {/* 同意書列表 */}
      {loading ? (
        <div className="text-center text-purple-200 py-8">載入中...</div>
      ) : consentForms.length === 0 ? (
        <div className="text-center text-purple-300 py-8">
          <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>尚無同意書記錄</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consentForms.map(form => (
            <Card key={form.id} className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{form.template_title}</h4>
                    <p className="text-sm text-purple-200 mt-1">
                      簽署日期：{new Date(form.signed_at).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewForm(form)}
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30"
                      size="sm"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteForm(form.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 新增同意書對話框 */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl border border-white/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">建立新同意書</h2>

              {/* 範本選擇 */}
              <div className="mb-6">
                <label className="block text-purple-200 mb-2">選擇範本 *</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="" className="bg-purple-900">請選擇同意書範本</option>
                  <option value="cosmetic_surgery" className="bg-purple-900">美容醫學手術同意書</option>
                  <option value="laser_treatment" className="bg-purple-900">光電治療同意書</option>
                  <option value="injection_treatment" className="bg-purple-900">注射治療同意書</option>
                </select>
              </div>

              {template && (
                <>
                  {/* 必填欄位 */}
                  <div className="mb-6 space-y-4">
                    <h3 className="text-lg font-semibold text-purple-100">基本資料</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {template.required_fields.map(field => (
                        <div key={field}>
                          <label className="block text-purple-200 mb-1 text-sm">{field} *</label>
                          <input
                            type={field.includes('日期') ? 'date' : 'text'}
                            value={formData[field] || ''}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 同意書內容 */}
                  <div className="mb-6 bg-white/5 p-4 rounded-lg border border-white/10 max-h-60 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-purple-100 mb-4">{template.title}</h3>
                    {template.content_sections.map((section, idx) => (
                      <div key={idx} className="mb-4">
                        <h4 className="font-semibold text-purple-200 mb-2">{section.section}</h4>
                        <ul className="list-disc list-inside text-purple-300 text-sm space-y-1">
                          {section.items.map((item, itemIdx) => (
                            <li key={itemIdx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* 確認事項 */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-purple-100 mb-3">確認事項</h3>
                    <div className="space-y-2">
                      {[
                        '我已詳細閱讀並完全了解上述說明內容',
                        '我已了解此療程的風險、併發症及可能的後果',
                        '我已了解療程的預期效果及可能的限制',
                        '我已了解術後照護的重要性及注意事項',
                        '我同意接受此項療程，並願意承擔相關風險'
                      ].map((item, idx) => (
                        <label key={idx} className="flex items-center text-purple-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checkboxes[`confirm_${idx}`] || false}
                            onChange={(e) => setCheckboxes({ ...checkboxes, [`confirm_${idx}`]: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 簽名區 */}
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-purple-200 mb-2">病患簽名 *</h4>
                      <div className="bg-white rounded-lg p-2">
                        <SignatureCanvas
                          ref={patientSigRef}
                          canvasProps={{
                            className: 'w-full h-32 border border-gray-300 rounded'
                          }}
                        />
                      </div>
                      <Button
                        onClick={() => patientSigRef.current?.clear()}
                        className="mt-2 text-xs bg-white/10 hover:bg-white/20 text-white"
                        size="sm"
                      >
                        清除
                      </Button>
                    </div>
                    <div>
                      <h4 className="text-purple-200 mb-2">醫師簽名 *</h4>
                      <div className="bg-white rounded-lg p-2">
                        <SignatureCanvas
                          ref={doctorSigRef}
                          canvasProps={{
                            className: 'w-full h-32 border border-gray-300 rounded'
                          }}
                        />
                      </div>
                      <Button
                        onClick={() => doctorSigRef.current?.clear()}
                        className="mt-2 text-xs bg-white/10 hover:bg-white/20 text-white"
                        size="sm"
                      >
                        清除
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* 按鈕 */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveConsentForm}
                  disabled={!template}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold py-3"
                >
                  儲存同意書
                </Button>
                <Button
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 查看同意書對話框 */}
      {showViewDialog && selectedForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white backdrop-blur-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedForm.template_title}</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePrint}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    列印
                  </Button>
                  <Button
                    onClick={() => setShowViewDialog(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                  >
                    關閉
                  </Button>
                </div>
              </div>

              {/* 表單內容 */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">基本資料</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selectedForm.form_data || {}).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium text-gray-600">{key}：</span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">簽名</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">病患簽名</p>
                      {selectedForm.patient_signature && (
                        <img src={selectedForm.patient_signature} alt="病患簽名" className="border rounded p-2 bg-gray-50" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">醫師簽名</p>
                      {selectedForm.doctor_signature && (
                        <img src={selectedForm.doctor_signature} alt="醫師簽名" className="border rounded p-2 bg-gray-50" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  <p>簽署時間：{new Date(selectedForm.signed_at).toLocaleString('zh-TW')}</p>
                  <p className="mt-1">表單編號：{selectedForm.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ConsentFormManager
